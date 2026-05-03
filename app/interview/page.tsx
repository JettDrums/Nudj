"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "assistant"; content: string };
const SESSION_ID = Math.random().toString(36).slice(2);

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      startInterview();
    });
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function startInterview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/interview/start?session_id=${SESSION_ID}`, { method: "POST" });
      const data = await res.json();
      const msg = data.assistant_message || (data.error ? `Error: ${data.error}` : "Hey — ready to build your agent? Tell me a bit about yourself.");
      setMessages([{ role: "assistant", content: msg }]);
      setStarted(true);
    } catch (e) {
      setMessages([{ role: "assistant", content: "Hey — ready to build your agent? Tell me a bit about yourself." }]);
      setStarted(true);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newHistory: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, user_message: userMsg, history: messages }),
      });
      const data = await res.json();
      const reply = data.assistant_message || (data.error ? `Error: ${data.error}` : "Something went wrong — try again?");
      setMessages([...newHistory, { role: "assistant", content: reply }]);
      if (data.profile_complete && data.profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").upsert({ id: user.id, ...data.profile, updated_at: new Date().toISOString() });
        }
        localStorage.setItem("nudg_profile", JSON.stringify(data.profile));
        setTimeout(() => router.push("/dashboard"), 1800);
      }
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Lost connection — try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>nudg</Link>
        <div style={s.pill}>Building your agent</div>
      </nav>

      {/* Initial loading splash */}
      {!started && (
        <div style={s.splash}>
          <div style={s.splashDot} />
          <p style={s.splashText}>Your interview is starting…</p>
        </div>
      )}

      {/* Messages */}
      {started && (
        <div style={s.feed}>
          <div style={s.feedInner}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? s.userRow : s.agentRow}>
                {m.role === "assistant" && <div style={s.avatar}>N</div>}
                <div style={m.role === "user" ? s.userBubble : s.agentBubble}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={s.agentRow}>
                <div style={s.avatar}>N</div>
                <div style={s.agentBubble}><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input */}
      {started && (
        <div style={s.inputWrap}>
          <div style={s.inputBox}>
            <textarea
              ref={inputRef}
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts…"
              rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }} onClick={send} disabled={loading || !input.trim()}>
              ↑
            </button>
          </div>
          <p style={s.hint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return <span style={{ letterSpacing: "3px", color: "#B8A8E8" }}>{"●".repeat(frame + 1)}</span>;
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", height: "100vh", background: "#F5F0FF", overflow: "hidden" },

  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#fff", borderBottom: "1px solid #EAE2FF", flexShrink: 0 },
  logo: { fontSize: "22px", fontWeight: 800, letterSpacing: "-2px", color: "#1A0A2E", textDecoration: "none" },
  pill: { background: "#F0EBFF", color: "#7C4DFF", fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "20px", letterSpacing: "0.3px" },

  splash: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" },
  splashDot: { width: "14px", height: "14px", borderRadius: "50%", background: "#7C4DFF", boxShadow: "0 0 0 8px rgba(124,77,255,0.15)", animation: "pulse 1.4s ease infinite" },
  splashText: { color: "#A99BC4", fontSize: "16px", margin: 0 },

  feed: { flex: 1, overflowY: "auto", padding: "24px 16px 8px" },
  feedInner: { maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },

  agentRow: { display: "flex", alignItems: "flex-end", gap: "10px" },
  userRow: { display: "flex", justifyContent: "flex-end" },

  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #7C4DFF, #B47FFF)", color: "#fff", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  agentBubble: { background: "#fff", color: "#1A0A2E", padding: "14px 18px", borderRadius: "4px 18px 18px 18px", maxWidth: "72%", fontSize: "16px", lineHeight: 1.6, border: "1px solid #EAE2FF", boxShadow: "0 2px 8px rgba(124,77,255,0.06)" },
  userBubble: { background: "linear-gradient(135deg, #7C4DFF, #9B6BFF)", color: "#fff", padding: "14px 18px", borderRadius: "18px 18px 4px 18px", maxWidth: "72%", fontSize: "16px", lineHeight: 1.6, boxShadow: "0 2px 10px rgba(124,77,255,0.25)" },

  inputWrap: { padding: "12px 16px 20px", background: "#F5F0FF", borderTop: "1px solid #EAE2FF", flexShrink: 0 },
  inputBox: { maxWidth: "680px", margin: "0 auto", display: "flex", gap: "10px", alignItems: "flex-end", background: "#fff", border: "1px solid #EAE2FF", borderRadius: "24px", padding: "8px 8px 8px 18px", boxShadow: "0 2px 12px rgba(124,77,255,0.08)" },
  input: { flex: 1, background: "transparent", color: "#1A0A2E", border: "none", fontSize: "16px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: "120px" },
  sendBtn: { background: "linear-gradient(135deg, #7C4DFF, #9B6BFF)", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "opacity 0.15s" },
  hint: { maxWidth: "680px", margin: "6px auto 0", fontSize: "12px", color: "#C4B5F0", textAlign: "center" },
};

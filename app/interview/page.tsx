"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

const SESSION_ID = Math.random().toString(36).slice(2);

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { startInterview(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function startInterview() {
    setLoading(true);
    try {
      const res = await fetch(`/api/interview/start?session_id=${SESSION_ID}`, { method: "POST" });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.assistant_message }]);
    } catch {
      setMessages([{ role: "assistant", content: "Hey — ready to build your agent? Tell me a bit about yourself." }]);
    } finally {
      setLoading(false);
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
      setMessages([...newHistory, { role: "assistant", content: data.assistant_message }]);

      if (data.profile_complete && data.profile) {
        localStorage.setItem("nudj_profile", JSON.stringify(data.profile));
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Lost connection — try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>nudj</Link>
        <p style={styles.navHint}>Building your agent</p>
      </nav>

      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={m.role === "user" ? styles.userBubble : styles.agentBubble}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.agentBubble}>
            <span style={styles.typing}>···</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBar}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button style={styles.sendBtn} onClick={send} disabled={loading}>↑</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", height: "100vh", background: "#F5F0FF" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #E4DAFF", background: "#fff" },
  logo: { fontSize: "22px", fontWeight: 800, letterSpacing: "-2px", color: "#1A0A2E", textDecoration: "none" },
  navHint: { color: "#C4B5F0", fontSize: "13px", margin: 0 },
  messages: { flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "700px", width: "100%", margin: "0 auto", boxSizing: "border-box" },
  agentBubble: { background: "#fff", color: "#1A0A2E", padding: "14px 18px", borderRadius: "18px 18px 18px 4px", maxWidth: "75%", fontSize: "16px", lineHeight: 1.5, border: "1px solid #E4DAFF", boxShadow: "0 1px 6px rgba(124,77,255,0.06)" },
  userBubble: { background: "#7C4DFF", color: "#fff", padding: "14px 18px", borderRadius: "18px 18px 4px 18px", maxWidth: "75%", fontSize: "16px", lineHeight: 1.5 },
  typing: { letterSpacing: "2px", color: "#C4B5F0" },
  inputBar: { borderTop: "1px solid #E4DAFF", padding: "12px 16px", display: "flex", gap: "8px", alignItems: "flex-end", maxWidth: "700px", width: "100%", margin: "0 auto", boxSizing: "border-box", background: "#F5F0FF" },
  input: { flex: 1, background: "#fff", color: "#1A0A2E", border: "1px solid #E4DAFF", borderRadius: "20px", padding: "12px 16px", fontSize: "16px", resize: "none", outline: "none", fontFamily: "inherit" },
  sendBtn: { background: "#7C4DFF", color: "#fff", border: "none", borderRadius: "50%", width: "42px", height: "42px", fontSize: "18px", fontWeight: 700, cursor: "pointer", flexShrink: 0 },
};

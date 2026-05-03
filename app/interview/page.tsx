"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SESSION_ID = Math.random().toString(36).slice(2);

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      if (data.profile_complete) setDone(true);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Lost my train of thought — try again?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={m.role === "user" ? styles.userBubble : styles.agentBubble}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={styles.agentBubble}>...</div>}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBar}>
        {done ? (
          <p style={{ color: "#fff", fontSize: "18px", fontWeight: 600, margin: 0 }}>
            Your agent is ready. ✓
          </p>
        ) : (
          <>
            <textarea
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type here..."
              rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button style={styles.sendBtn} onClick={send} disabled={loading}>↑</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", flexDirection: "column", height: "100vh" },
  messages: { flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "12px" },
  agentBubble: { background: "#1A1A1A", color: "#fff", padding: "14px 18px", borderRadius: "18px", maxWidth: "75%", fontSize: "16px", lineHeight: 1.5 },
  userBubble: { background: "#fff", color: "#0A0A0A", padding: "14px 18px", borderRadius: "18px", maxWidth: "75%", fontSize: "16px", lineHeight: 1.5 },
  inputBar: { borderTop: "1px solid #1A1A1A", padding: "12px 16px", display: "flex", gap: "8px", alignItems: "flex-end" },
  input: { flex: 1, background: "#1A1A1A", color: "#fff", border: "none", borderRadius: "20px", padding: "12px 16px", fontSize: "16px", resize: "none", outline: "none", fontFamily: "inherit" },
  sendBtn: { background: "#fff", color: "#0A0A0A", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", fontWeight: 700, cursor: "pointer" },
};

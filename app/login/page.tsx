"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>nudg</Link>
      </nav>

      <div style={s.center}>
        <div style={s.card}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.sub}>Log in to check on your agent.</p>

          <form onSubmit={handleLogin} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={s.input}
                placeholder="you@example.com"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={s.input}
                placeholder="••••••••"
              />
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p style={s.switch}>
            No account?{" "}
            <Link href="/signup" style={s.link}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #F5F0FF 0%, #EDE8FF 100%)" },
  nav: { padding: "20px 24px", borderBottom: "1px solid #E4DAFF", background: "#fff" },
  logo: { fontSize: "24px", fontWeight: 800, letterSpacing: "-2px", color: "#1A0A2E", textDecoration: "none" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 65px)", padding: "24px" },
  card: { background: "#fff", border: "1px solid #E4DAFF", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(124,77,255,0.08)" },
  title: { margin: "0 0 8px", fontSize: "28px", fontWeight: 800, color: "#1A0A2E", letterSpacing: "-1px" },
  sub: { margin: "0 0 32px", color: "#A99BC4", fontSize: "15px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#7B6A9B", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { background: "#F5F0FF", border: "1px solid #E4DAFF", borderRadius: "12px", padding: "14px 16px", fontSize: "16px", color: "#1A0A2E", outline: "none", fontFamily: "inherit" },
  error: { color: "#E05555", fontSize: "14px", margin: 0, background: "#FFF0F0", padding: "10px 14px", borderRadius: "8px", border: "1px solid #FFCCCC" },
  btn: { background: "#7C4DFF", color: "#fff", border: "none", borderRadius: "50px", padding: "16px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" },
  switch: { textAlign: "center", marginTop: "24px", color: "#A99BC4", fontSize: "14px" },
  link: { color: "#7C4DFF", fontWeight: 600, textDecoration: "none" },
};

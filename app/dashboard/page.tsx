"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const raw = localStorage.getItem("nudj_profile");
    if (raw) setProfile(JSON.parse(raw));
    const interval = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>nudj</Link>
        <div style={styles.navLinks}>
          <Link href="/dashboard" style={styles.navActive}>Agent</Link>
          <Link href="/profile" style={styles.navLink}>Profile</Link>
        </div>
      </nav>

      <div style={styles.content}>
        {profile ? (
          <>
            <div style={styles.agentCard}>
              <div style={styles.agentPulse} />
              <div>
                <p style={styles.agentStatus}>Your agent is active{dots}</p>
                <p style={styles.agentSub}>Mingling in the background. You'll be notified when there's a match.</p>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Agent Summary</h2>
              <div style={styles.grid}>
                {[
                  { label: "Personality", value: profile.personality },
                  { label: "Lifestyle", value: profile.lifestyle },
                  { label: "Values", value: profile.values },
                  { label: "Relationship Goals", value: profile.relationship_goals },
                  { label: "Humor & Interests", value: profile.humor },
                  { label: "Dealbreakers", value: profile.dealbreakers },
                ].map(({ label, value }) => value ? (
                  <div key={label} style={styles.card}>
                    <p style={styles.cardLabel}>{label}</p>
                    <p style={styles.cardValue}>{value}</p>
                  </div>
                ) : null)}
              </div>
            </div>

            <div style={styles.actions}>
              <Link href="/profile" style={styles.editBtn}>Edit Preferences</Link>
              <Link href="/interview" style={styles.rebuildBtn}>Rebuild Agent</Link>
            </div>
          </>
        ) : (
          <div style={styles.empty}>
            <p style={styles.emptyText}>You haven't built your agent yet.</p>
            <Link href="/interview" style={styles.primaryBtn}>Build My Agent</Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0A0A0A", color: "#fff" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #1A1A1A" },
  logo: { fontSize: "24px", fontWeight: 800, letterSpacing: "-2px", color: "#fff", textDecoration: "none" },
  navLinks: { display: "flex", gap: "24px" },
  navLink: { color: "#666", textDecoration: "none", fontSize: "15px" },
  navActive: { color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: 600 },
  content: { maxWidth: "800px", margin: "0 auto", padding: "40px 24px" },
  agentCard: { background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "24px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" },
  agentPulse: { width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", flexShrink: 0 },
  agentStatus: { margin: 0, fontSize: "18px", fontWeight: 600, color: "#fff" },
  agentSub: { margin: "4px 0 0", fontSize: "14px", color: "#666" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "13px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" },
  card: { background: "#111", border: "1px solid #1A1A1A", borderRadius: "12px", padding: "16px" },
  cardLabel: { margin: "0 0 6px", fontSize: "12px", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" },
  cardValue: { margin: 0, fontSize: "14px", color: "#ccc", lineHeight: 1.5 },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap" },
  editBtn: { background: "#fff", color: "#0A0A0A", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "14px", fontWeight: 700 },
  rebuildBtn: { background: "transparent", color: "#fff", padding: "12px 28px", borderRadius: "50px", textDecoration: "none", fontSize: "14px", fontWeight: 600, border: "1px solid #333" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px" },
  emptyText: { color: "#666", fontSize: "18px" },
  primaryBtn: { background: "#fff", color: "#0A0A0A", padding: "16px 36px", borderRadius: "50px", textDecoration: "none", fontSize: "16px", fontWeight: 700 },
};

import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.container}>
      <div style={styles.badge}>Beta</div>
      <h1 style={styles.logo}>nudj</h1>
      <p style={styles.tagline}>
        Your agent meets theirs.<br />If they click, you get a date.
      </p>
      <div style={styles.buttons}>
        <Link href="/interview" style={styles.primaryBtn}>Build My Agent</Link>
        <Link href="/dashboard" style={styles.secondaryBtn}>View Dashboard</Link>
      </div>
      <p style={styles.sub}>No swiping. No bios. Just your AI working for you.</p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    gap: "20px",
    background: "#0A0A0A",
  },
  badge: {
    background: "#1A1A1A",
    color: "#888",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  logo: {
    fontSize: "80px",
    fontWeight: 800,
    letterSpacing: "-5px",
    margin: 0,
    color: "#fff",
  },
  tagline: {
    fontSize: "20px",
    color: "#666",
    textAlign: "center",
    lineHeight: 1.6,
    margin: 0,
  },
  buttons: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryBtn: {
    background: "#fff",
    color: "#0A0A0A",
    padding: "16px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "transparent",
    color: "#fff",
    padding: "16px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 600,
    border: "1px solid #333",
  },
  sub: {
    color: "#444",
    fontSize: "14px",
    margin: 0,
  },
};

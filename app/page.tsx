import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.container}>
      <h1 style={styles.logo}>nudj</h1>
      <p style={styles.tagline}>
        Your agent meets theirs.<br />If they click, you get a date.
      </p>
      <Link href="/interview" style={styles.button}>
        Build My Agent
      </Link>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "32px",
    gap: "24px",
  },
  logo: {
    fontSize: "72px",
    fontWeight: 700,
    letterSpacing: "-4px",
    margin: 0,
    color: "#fff",
  },
  tagline: {
    fontSize: "20px",
    color: "#888",
    textAlign: "center" as const,
    lineHeight: 1.6,
    margin: 0,
  },
  button: {
    background: "#fff",
    color: "#0A0A0A",
    padding: "16px 40px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 600,
    marginTop: "16px",
  },
};

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FIELDS = [
  { key: "personality", label: "Personality", placeholder: "How would you describe your communication style and personality?" },
  { key: "lifestyle", label: "Lifestyle", placeholder: "What does your typical day/week look like?" },
  { key: "values", label: "Values", placeholder: "What do you believe in? What matters most to you?" },
  { key: "relationship_goals", label: "Relationship Goals", placeholder: "What are you looking for in a partner?" },
  { key: "humor", label: "Humor & Interests", placeholder: "What makes you laugh? What are you into?" },
  { key: "dealbreakers", label: "Dealbreakers", placeholder: "What are absolute dealbreakers for you?" },
];

export default function Profile() {
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("nudg_profile");
    if (raw) setProfile(JSON.parse(raw));
    const storedPhotos = localStorage.getItem("nudg_photos");
    if (storedPhotos) setPhotos(JSON.parse(storedPhotos));
  }, []);

  function handleChange(key: string, value: string) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function save() {
    localStorage.setItem("nudg_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPhotos((prev) => {
          const updated = [...prev, url].slice(0, 6);
          localStorage.setItem("nudg_photos", JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(i: number) {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      localStorage.setItem("nudg_photos", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>nudg</Link>
        <div style={styles.navLinks}>
          <Link href="/dashboard" style={styles.navLink}>Agent</Link>
          <Link href="/profile" style={styles.navActive}>Profile</Link>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>Your Profile</h1>
        <p style={styles.subtitle}>Your agent uses this to find matches. Be honest — the AI works better with real answers.</p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Photos</h2>
          <div style={styles.photoGrid}>
            {photos.map((src, i) => (
              <div key={i} style={styles.photoWrapper}>
                <img src={src} alt="" style={styles.photo} />
                <button style={styles.removePhoto} onClick={() => removePhoto(i)}>×</button>
              </div>
            ))}
            {photos.length < 6 && (
              <button style={styles.addPhoto} onClick={() => fileRef.current?.click()}>
                <span style={{ fontSize: "28px", color: "#C4B5F0" }}>+</span>
                <span style={{ fontSize: "12px", color: "#A99BC4" }}>Add photo</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhoto} />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Preferences</h2>
          <div style={styles.fields}>
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <textarea
                  style={styles.textarea}
                  value={profile[key] ?? ""}
                  placeholder={placeholder}
                  rows={3}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={saved ? styles.savedBtn : styles.saveBtn} onClick={save}>
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
          <Link href="/dashboard" style={styles.cancelBtn}>Back to Agent</Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #F5F0FF 0%, #EDE8FF 100%)", color: "#1A0A2E" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E4DAFF", background: "#fff" },
  logo: { fontSize: "24px", fontWeight: 800, letterSpacing: "-2px", color: "#1A0A2E", textDecoration: "none" },
  navLinks: { display: "flex", gap: "24px" },
  navLink: { color: "#A99BC4", textDecoration: "none", fontSize: "15px" },
  navActive: { color: "#7C4DFF", textDecoration: "none", fontSize: "15px", fontWeight: 600 },
  content: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: "32px", fontWeight: 700, margin: "0 0 8px", color: "#1A0A2E" },
  subtitle: { color: "#A99BC4", fontSize: "15px", margin: "0 0 40px", lineHeight: 1.5 },
  section: { marginBottom: "40px" },
  sectionTitle: { fontSize: "13px", fontWeight: 600, color: "#A99BC4", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  photoWrapper: { position: "relative", aspectRatio: "1", borderRadius: "12px", overflow: "hidden" },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  removePhoto: { position: "absolute", top: "6px", right: "6px", background: "rgba(124,77,255,0.8)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "16px", lineHeight: "22px", textAlign: "center" },
  addPhoto: { aspectRatio: "1", background: "#fff", border: "2px dashed #D4C8FF", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px" },
  fields: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: 600, color: "#4A3A6A" },
  textarea: { background: "#fff", border: "1px solid #E4DAFF", borderRadius: "10px", padding: "12px 14px", color: "#1A0A2E", fontSize: "14px", lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit" },
  footer: { display: "flex", gap: "12px", alignItems: "center", paddingTop: "8px" },
  saveBtn: { background: "#7C4DFF", color: "#fff", padding: "14px 32px", borderRadius: "50px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  savedBtn: { background: "#22C55E", color: "#fff", padding: "14px 32px", borderRadius: "50px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  cancelBtn: { color: "#A99BC4", textDecoration: "none", fontSize: "15px" },
};

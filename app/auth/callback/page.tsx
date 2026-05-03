"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F5F0FF 0%, #EDE8FF 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#7C4DFF", boxShadow: "0 0 0 8px rgba(124,77,255,0.15)" }} />
      <p style={{ color: "#A99BC4", fontSize: "16px", margin: 0 }}>Confirming your account…</p>
    </div>
  );
}

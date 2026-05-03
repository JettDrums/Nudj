import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nudj",
  description: "Your agent meets theirs. If they click, you get a date.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F5F0FF", color: "#1A0A2E", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

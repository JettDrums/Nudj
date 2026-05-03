import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, PROFILE_PROMPT } from "../shared";

async function cohereChat(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "command-a-03-2025", messages }),
  });
  const raw = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(raw); } catch { throw new Error(`Non-JSON from Cohere: ${raw.slice(0, 300)}`); }
  if ((data as any).message?.content?.[0]?.text) return (data as any).message.content[0].text as string;
  if ((data as any).text) return (data as any).text as string;
  throw new Error(`Cohere response: ${raw.slice(0, 500)}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history: { role: string; content: string }[] = body.history ?? [];
    const userMessage: string = body.user_message ?? "";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
      { role: "user", content: userMessage },
    ];

    const reply = await cohereChat(messages);
    const profileComplete = reply.toLowerCase().includes("let me put your agent together");

    let profile = null;
    if (profileComplete) {
      const convo = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      const raw = await cohereChat([{ role: "user", content: `${PROFILE_PROMPT}\n\nCONVERSATION:\n${convo}` }]);
      try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        profile = JSON.parse(cleaned);
      } catch {
        profile = null;
      }
    }

    return NextResponse.json({ assistant_message: reply, profile_complete: profileComplete, profile });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

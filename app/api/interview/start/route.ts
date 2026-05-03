import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "../shared";

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
    const reply = await cohereChat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Hello, I'm ready to start." },
    ]);
    return NextResponse.json({ assistant_message: reply, profile_complete: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Cover these areas one at a time: personality, lifestyle, values, relationship goals, physical preferences, humor/interests, dealbreakers.

Rules: Ask ONE question at a time. Keep responses concise. After 10-15 exchanges end with: "I think I have a really good picture of you now. Let me put your agent together."

Start with a warm intro and your first question.`;

async function cohereChat(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "command-r-plus", messages }),
  });
  const data = await res.json();
  return data.message.content[0].text as string;
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

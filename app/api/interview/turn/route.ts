import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Cover these areas one at a time: personality, lifestyle, values, relationship goals, physical preferences, humor/interests, dealbreakers.

Rules: Ask ONE question at a time. Keep responses concise. After 10-15 exchanges end with: "I think I have a really good picture of you now. Let me put your agent together."`;

const PROFILE_PROMPT = `Based on this interview, return ONLY valid JSON:
{
  "personality": "2-3 sentence summary",
  "lifestyle": "daily rhythm and habits",
  "values": "core values and worldview",
  "relationship_goals": "what they want in a relationship",
  "humor": "sense of humor and interests",
  "dealbreakers": "absolute dealbreakers",
  "agent_persona": "1 paragraph: how their AI agent should present itself to other agents",
  "profile_complete": true
}`;

async function cohereChat(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "command-r-plus-08-2024", messages }),
  });
  const data = await res.json();
  if (data.message?.content?.[0]?.text) return data.message.content[0].text as string;
  if (data.text) return data.text as string;
  throw new Error(`Unexpected Cohere response: ${JSON.stringify(data)}`)
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

import anthropic
import json
from app.core.config import settings
from app.models.interview import Message

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

INTERVIEW_SYSTEM_PROMPT = """You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Your interview covers these areas progressively (don't rush — one topic at a time):
1. Personality & communication style
2. Lifestyle & daily rhythm
3. Values, beliefs & worldview
4. Relationship goals & what they've learned from past relationships
5. Physical/aesthetic preferences (honest, shame-free)
6. Humor, culture & intellectual interests
7. Dealbreakers & non-negotiables

Rules:
- Ask ONE question at a time
- Follow up naturally on interesting answers before moving on
- Catch contradictions gently ("Earlier you said X, but now it sounds like Y — help me understand that")
- Keep responses concise — this is a conversation, not an essay
- After roughly 10-15 exchanges, if you have enough to build a profile, end with: "I think I have a really good picture of you now. Let me put your agent together."

Start the conversation with a warm, brief intro and your first question about them."""

PROFILE_EXTRACTION_PROMPT = """Based on this interview conversation, extract a structured profile. Return ONLY valid JSON with these fields:

{
  "personality": "2-3 sentence summary of their personality and communication style",
  "lifestyle": "their daily rhythm, habits, activity level",
  "values": "core values and worldview",
  "relationship_goals": "what they want in a relationship and lessons from the past",
  "humor": "sense of humor and intellectual/cultural interests",
  "dealbreakers": "absolute dealbreakers",
  "attraction_notes": "physical and aesthetic preferences noted",
  "agent_persona": "1 paragraph describing how their AI agent should present itself when meeting other agents",
  "profile_complete": true
}"""


async def run_interview_turn(history: list[Message], user_message: str) -> tuple[str, bool]:
    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=INTERVIEW_SYSTEM_PROMPT,
        messages=messages,
    )

    assistant_reply = response.content[0].text
    profile_complete = "let me put your agent together" in assistant_reply.lower()

    return assistant_reply, profile_complete


async def extract_profile(history: list[Message]) -> dict:
    conversation_text = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in history
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"{PROFILE_EXTRACTION_PROMPT}\n\nCONVERSATION:\n{conversation_text}",
            }
        ],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)

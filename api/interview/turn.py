import os
from http.server import BaseHTTPRequestHandler
import json
import cohere

SYSTEM_PROMPT = """You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Your interview covers these areas progressively (one topic at a time):
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
- Keep responses concise — this is a conversation, not an essay
- After roughly 10-15 exchanges, end with: "I think I have a really good picture of you now. Let me put your agent together."
"""

PROFILE_PROMPT = """Based on this interview, extract a structured profile. Return ONLY valid JSON:

{
  "personality": "2-3 sentence summary",
  "lifestyle": "daily rhythm and habits",
  "values": "core values and worldview",
  "relationship_goals": "what they want in a relationship",
  "humor": "sense of humor and interests",
  "dealbreakers": "absolute dealbreakers",
  "agent_persona": "1 paragraph: how their AI agent should present itself to other agents",
  "profile_complete": true
}"""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))

        history = body.get("history", [])
        user_message = body.get("user_message", "")

        co = cohere.ClientV2(api_key=os.environ.get("COHERE_API_KEY", ""))

        # Build messages list
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history:
            role = "user" if m["role"] == "user" else "assistant"
            messages.append({"role": role, "content": m["content"]})
        messages.append({"role": "user", "content": user_message})

        response = co.chat(model="command-r-plus", messages=messages)
        reply = response.message.content[0].text
        profile_complete = "let me put your agent together" in reply.lower()

        profile = None
        if profile_complete:
            convo = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
            convo += f"\nASSISTANT: {reply}"
            ext = co.chat(
                model="command-r-plus",
                messages=[{"role": "user", "content": f"{PROFILE_PROMPT}\n\nCONVERSATION:\n{convo}"}],
            )
            raw = ext.message.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            try:
                profile = json.loads(raw)
            except Exception:
                profile = None

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({
            "assistant_message": reply,
            "profile_complete": profile_complete,
            "profile": profile,
        }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

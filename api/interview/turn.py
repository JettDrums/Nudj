import os
import json
import urllib.request
from http.server import BaseHTTPRequestHandler

SYSTEM_PROMPT = """You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Cover these areas one at a time: personality, lifestyle, values, relationship goals, physical preferences, humor/interests, dealbreakers.

Rules: Ask ONE question at a time. Keep responses concise. After 10-15 exchanges end with: "I think I have a really good picture of you now. Let me put your agent together."
"""

PROFILE_PROMPT = """Based on this interview, return ONLY valid JSON with these fields:
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


def cohere_chat(messages):
    api_key = os.environ.get("COHERE_API_KEY", "")
    payload = json.dumps({"model": "command-r-plus", "messages": messages}).encode()
    req = urllib.request.Request(
        "https://api.cohere.com/v2/chat",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
    return data["message"]["content"][0]["text"]


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            history = body.get("history", [])
            user_message = body.get("user_message", "")

            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for m in history:
                messages.append({"role": "user" if m["role"] == "user" else "assistant", "content": m["content"]})
            messages.append({"role": "user", "content": user_message})

            reply = cohere_chat(messages)
            profile_complete = "let me put your agent together" in reply.lower()

            profile = None
            if profile_complete:
                convo = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
                raw = cohere_chat([{"role": "user", "content": f"{PROFILE_PROMPT}\n\nCONVERSATION:\n{convo}"}])
                raw = raw.strip()
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                try:
                    profile = json.loads(raw)
                except Exception:
                    profile = None

            self._respond({"assistant_message": reply, "profile_complete": profile_complete, "profile": profile})
        except Exception as e:
            self._respond({"error": str(e)}, status=500)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def _respond(self, body, status=200):
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

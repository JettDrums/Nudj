import os
import json
import urllib.request
from http.server import BaseHTTPRequestHandler

SYSTEM_PROMPT = """You are Nudj's interview AI. Your job is to deeply understand who this person is — not just their surface preferences, but their values, personality, and what they truly need in a partner.

You conduct a warm, natural conversation. You're curious, non-judgmental, and occasionally funny. You do NOT sound like a questionnaire.

Cover these areas one at a time: personality, lifestyle, values, relationship goals, physical preferences, humor/interests, dealbreakers.

Rules: Ask ONE question at a time. Keep responses concise. After 10-15 exchanges end with: "I think I have a really good picture of you now. Let me put your agent together."

Start with a warm intro and your first question."""


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
            reply = cohere_chat([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Hello, I'm ready to start."},
            ])
            self._respond({"assistant_message": reply, "profile_complete": False})
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

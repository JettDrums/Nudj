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

Start with a warm, brief intro and your first question."""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        co = cohere.ClientV2(api_key=os.environ.get("COHERE_API_KEY", ""))

        response = co.chat(
            model="command-r-plus",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Hello, I'm ready to start."},
            ],
        )

        reply = response.message.content[0].text
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({
            "assistant_message": reply,
            "profile_complete": False,
        }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

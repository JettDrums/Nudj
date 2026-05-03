from pydantic import BaseModel
from typing import Optional


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class InterviewRequest(BaseModel):
    session_id: str
    user_message: str
    history: list[Message] = []


class InterviewResponse(BaseModel):
    session_id: str
    assistant_message: str
    profile_complete: bool
    profile: Optional[dict] = None


class UserProfile(BaseModel):
    session_id: str
    personality: Optional[str] = None
    lifestyle: Optional[str] = None
    values: Optional[str] = None
    relationship_goals: Optional[str] = None
    humor: Optional[str] = None
    dealbreakers: Optional[str] = None
    raw_summary: Optional[str] = None

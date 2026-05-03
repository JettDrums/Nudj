from fastapi import APIRouter, HTTPException
from app.models.interview import InterviewRequest, InterviewResponse, Message
from app.services.interview_engine import run_interview_turn, extract_profile

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/turn", response_model=InterviewResponse)
async def interview_turn(request: InterviewRequest):
    try:
        reply, profile_complete = await run_interview_turn(
            history=request.history,
            user_message=request.user_message,
        )

        profile = None
        if profile_complete:
            full_history = request.history + [
                Message(role="user", content=request.user_message),
                Message(role="assistant", content=reply),
            ]
            profile = await extract_profile(full_history)

        return InterviewResponse(
            session_id=request.session_id,
            assistant_message=reply,
            profile_complete=profile_complete,
            profile=profile,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start", response_model=InterviewResponse)
async def start_interview(session_id: str):
    reply, _ = await run_interview_turn(history=[], user_message="Hello, I'm ready to start.")

    return InterviewResponse(
        session_id=session_id,
        assistant_message=reply,
        profile_complete=False,
    )

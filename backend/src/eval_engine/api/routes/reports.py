"""Report generation API endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Request
from ...models.session import EvaluationMode
from ...evaluation.interview import InterviewEvaluator
from ...evaluation.proctoring import ProctoringEvaluator
from ...evaluation.communication import CommunicationEvaluator
from .sessions import get_session_or_404

router = APIRouter(prefix="/api/sessions", tags=["reports"])

@router.get("/{session_id}/report")
async def generate_session_report(session_id: str, request: Request):
    """Generate evaluation report for a given session based on its configured mode."""
    session = get_session_or_404(session_id)
    
    llm_engine = getattr(request.app.state, "llm_engine", None)
    
    if session.config.mode == EvaluationMode.INTERVIEW:
        evaluator = InterviewEvaluator(llm_engine=llm_engine)
        return await evaluator.generate_report(session)
    elif session.config.mode == EvaluationMode.PROCTORING:
        evaluator = ProctoringEvaluator(llm_engine=llm_engine)
        return await evaluator.generate_report(session)
    elif session.config.mode == EvaluationMode.COMMUNICATION:
        evaluator = CommunicationEvaluator(llm_engine=llm_engine)
        return await evaluator.generate_report(session)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported evaluation mode: {session.config.mode}")

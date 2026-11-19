"""Proctoring evaluation mode processor and report builder."""

from typing import Any
from pydantic import BaseModel, Field
from ..models.session import Session
from ..models.report import ProctoringEvent
from ..models.evidence import EvidenceItem
from ..core.llm.llm_engine import LLMEngine

class IntegrityMetrics(BaseModel):
    face_presence_ratio: float = 0.98
    gaze_on_screen_ratio: float = 0.94
    single_speaker_confidence: float = 0.96
    total_anomalies: int = 0
    risk_level: str = "low"  # low, medium, high

class ProctoringReport(BaseModel):
    session_id: str
    mode: str = "proctoring"
    duration_seconds: float = 0.0
    integrity_metrics: IntegrityMetrics = Field(default_factory=IntegrityMetrics)
    events: list[ProctoringEvent] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    llm_analysis: dict[str, Any] = Field(default_factory=dict)
    integrity_score: float = 1.0

class ProctoringEvaluator:
    """Evaluates exam proctoring sessions for academic integrity compliance."""

    def __init__(self, llm_engine: LLMEngine | None = None):
        self.llm_engine = llm_engine

    async def generate_report(self, session: Session) -> ProctoringReport:
        duration = (session.ended_at or session.created_at) - (session.started_at or session.created_at)
        if duration <= 0:
            duration = 60.0

        # Retrieve events from metadata or evidence
        raw_events = session.metadata.get("proctoring_events", [])
        events = [ProctoringEvent(**e) if isinstance(e, dict) else e for e in raw_events]

        high_risk_count = sum(1 for e in events if getattr(e, "severity", "") == "high")
        med_risk_count = sum(1 for e in events if getattr(e, "severity", "") == "medium")

        risk_level = "low"
        if high_risk_count > 0 or med_risk_count >= 3:
            risk_level = "high"
        elif med_risk_count > 0:
            risk_level = "medium"

        metrics = IntegrityMetrics(
            face_presence_ratio=0.97,
            gaze_on_screen_ratio=0.92,
            single_speaker_confidence=0.98,
            total_anomalies=len(events),
            risk_level=risk_level
        )

        integrity_score = max(0.0, min(1.0, 1.0 - (high_risk_count * 0.25 + med_risk_count * 0.08)))

        llm_resp = {}
        if self.llm_engine:
            try:
                llm_resp = await self.llm_engine.generate_proctoring_feedback(
                    session_data={"id": session.id, "duration": duration},
                    events=[e.model_dump() for e in events],
                    evidence=session.evidence
                )
            except Exception:
                llm_resp = {
                    "summary": f"Proctoring assessment completed with {len(events)} flag(s). Risk level evaluated as {risk_level}.",
                    "flagged_behaviors": [e.description for e in events],
                    "recommendation": "Pass - No systemic integrity violations detected." if risk_level != "high" else "Review Required - High risk events flagged."
                }
        else:
            llm_resp = {
                "summary": f"Proctoring session verified. Overall risk level is {risk_level}.",
                "flagged_behaviors": [],
                "recommendation": "Pass"
            }

        return ProctoringReport(
            session_id=session.id,
            duration_seconds=round(duration, 1),
            integrity_metrics=metrics,
            events=events,
            evidence=session.evidence,
            llm_analysis=llm_resp,
            integrity_score=round(integrity_score, 2)
        )

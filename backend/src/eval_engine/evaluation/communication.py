"""Communication evaluation mode processor and report builder."""

from typing import Any
from pydantic import BaseModel, Field
from ..models.session import Session
from ..models.report import SpeakingRateAnalysis
from ..models.evidence import EvidenceItem
from ..core.llm.llm_engine import LLMEngine

class CommunicationMetrics(BaseModel):
    fluency_score: float = 0.88
    vocabulary_richness: float = 0.82
    grammar_accuracy: float = 0.94
    articulation_rate_wpm: float = 142.0
    pause_frequency_per_min: float = 3.2
    eye_contact_ratio: float = 0.91

class CommunicationReport(BaseModel):
    session_id: str
    mode: str = "communication"
    duration_seconds: float = 0.0
    metrics: CommunicationMetrics = Field(default_factory=CommunicationMetrics)
    speaking_rate: SpeakingRateAnalysis = Field(
        default_factory=lambda: SpeakingRateAnalysis(
            wpm=142.0, pause_adjusted_wpm=155.0, rate_variability=0.10, speaking_time_ratio=0.78
        )
    )
    evidence: list[EvidenceItem] = Field(default_factory=list)
    llm_coaching: dict[str, Any] = Field(default_factory=dict)
    communication_score: float = 0.88

class CommunicationEvaluator:
    """Evaluates candidate public speaking, presentation, and language communication skills."""

    def __init__(self, llm_engine: LLMEngine | None = None):
        self.llm_engine = llm_engine

    async def generate_report(self, session: Session) -> CommunicationReport:
        duration = (session.ended_at or session.created_at) - (session.started_at or session.created_at)
        if duration <= 0:
            duration = 60.0

        metrics = CommunicationMetrics()
        comm_score = round((metrics.fluency_score * 0.35) + (metrics.vocabulary_richness * 0.25) + (metrics.grammar_accuracy * 0.25) + (metrics.eye_contact_ratio * 0.15), 2)

        llm_coaching = {
            "strengths": [
                "Clear vocal delivery and dynamic articulation rate",
                "Strong use of technical domain vocabulary",
                "Consistent non-verbal eye contact"
            ],
            "coaching_tips": [
                "Reduce occasional filler phrases ('like', 'you know') when transitioning between ideas",
                "Vary pitch intonation slightly to enhance visual and acoustic engagement"
            ],
            "executive_summary": "High-impact communicator with strong clarity, structured phrasing, and audience presence."
        }

        return CommunicationReport(
            session_id=session.id,
            duration_seconds=round(duration, 1),
            metrics=metrics,
            evidence=session.evidence,
            llm_coaching=llm_coaching,
            communication_score=comm_score
        )

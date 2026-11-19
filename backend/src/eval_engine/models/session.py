import time
from enum import Enum
from uuid import uuid4
from pydantic import BaseModel, Field
from .observation import Observation
from .evidence import EvidenceItem

class EvaluationMode(str, Enum):
    """The mode of the evaluation session."""
    INTERVIEW = "interview"
    PROCTORING = "proctoring"
    COMMUNICATION = "communication"

class SessionStatus(str, Enum):
    """Current state of the evaluation session."""
    CREATED = "created"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"

class SessionConfig(BaseModel):
    """Configuration for setting up an evaluation session."""
    mode: EvaluationMode = EvaluationMode.INTERVIEW
    questions: list[dict] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=lambda: ["en"])
    enable_proctoring: bool = True
    enable_video: bool = True
    enable_audio: bool = True
    record_session: bool = False

class Session(BaseModel):
    """An overarching session entity representing an evaluation attempt."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: SessionStatus = SessionStatus.CREATED
    config: SessionConfig = Field(default_factory=SessionConfig)
    created_at: float = Field(default_factory=time.time)
    started_at: float | None = None
    ended_at: float | None = None
    observations: list[Observation] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)

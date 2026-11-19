from enum import Enum
import time
from uuid import uuid4
from pydantic import BaseModel, Field

class EventType(str, Enum):
    # Vision
    FACE_DETECTED = "FACE_DETECTED"
    FACE_LOST = "FACE_LOST"
    MULTIPLE_FACES = "MULTIPLE_FACES"
    HEAD_ORIENTATION_CHANGED = "HEAD_ORIENTATION_CHANGED"
    GAZE_DEVIATION = "GAZE_DEVIATION"
    EXPRESSION_CHANGED = "EXPRESSION_CHANGED"
    IDENTITY_CHANGE = "IDENTITY_CHANGE"
    FRAME_DEPARTURE = "FRAME_DEPARTURE"
    # Audio
    SPEECH_STARTED = "SPEECH_STARTED"
    SPEECH_STOPPED = "SPEECH_STOPPED"
    PAUSE_DETECTED = "PAUSE_DETECTED"
    HESITATION_DETECTED = "HESITATION_DETECTED"
    RATE_CHANGED = "RATE_CHANGED"
    FILLER_DETECTED = "FILLER_DETECTED"
    OTHER_SPEAKER_DETECTED = "OTHER_SPEAKER_DETECTED"
    AUDIO_ANOMALY = "AUDIO_ANOMALY"
    # NLP / Engine
    QUESTION_DETECTED = "QUESTION_DETECTED"
    ANSWER_STARTED = "ANSWER_STARTED"
    ANSWER_COMPLETED = "ANSWER_COMPLETED"
    TECHNICAL_CONCEPT = "TECHNICAL_CONCEPT"
    # Output
    PROCTORING_ALERT = "PROCTORING_ALERT"
    STATE_TRANSITION = "STATE_TRANSITION"
    EVIDENCE_CREATED = "EVIDENCE_CREATED"

class EngineEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: EventType
    timestamp: float = Field(default_factory=time.time)
    duration: float = 0.0
    probability: float = Field(ge=0.0, le=1.0, default=1.0)
    source: str = ""
    session_id: str = ""
    data: dict = Field(default_factory=dict)
    evidence: list[str] = Field(default_factory=list)

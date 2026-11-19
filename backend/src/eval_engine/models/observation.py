from enum import Enum
from typing import Any
from uuid import uuid4
from pydantic import BaseModel, Field

class Modality(str, Enum):
    """Supported modalities for observations."""
    VISION = "vision"
    AUDIO = "audio"
    SPEECH = "speech"
    NLP = "nlp"
    FUSION = "fusion"

class Observation(BaseModel):
    """An atomic observation extracted from a modality."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    timestamp: float
    duration: float = 0.0
    modality: Modality
    feature: str
    value: Any
    probability: float = Field(ge=0.0, le=1.0, default=1.0)
    model_confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    source: str = ""
    evidence_reference: str = ""
    metadata: dict = Field(default_factory=dict)

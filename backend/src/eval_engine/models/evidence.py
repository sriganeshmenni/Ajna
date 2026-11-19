from enum import Enum
from typing import Any
from uuid import uuid4
from pydantic import BaseModel, Field
from .observation import Modality

class Signal(BaseModel):
    """Underlying signal triggering an evidence item."""
    modality: Modality
    feature: str
    value: Any
    unit: str = ""
    context: str = ""

class RiskLevel(str, Enum):
    """Severity or risk level associated with evidence."""
    INFORMATIONAL = "informational"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class EvidenceItem(BaseModel):
    """Evidence detected from evaluation logic."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    indicator: str
    indicator_type: str
    severity: RiskLevel = RiskLevel.INFORMATIONAL
    timestamp_start: float
    timestamp_end: float
    duration: float = 0.0
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)
    supporting_signals: list[Signal] = Field(default_factory=list)
    resolution: str = ""
    risk_level: RiskLevel = RiskLevel.INFORMATIONAL

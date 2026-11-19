import time
from typing import Dict, List, Any
from pydantic import BaseModel

class EvidenceItem(BaseModel):
    id: str
    event_type: str
    supporting_signals: List[str]
    start_time: float
    end_time: float
    confidence: float
    severity: str
    resolution: str

class EvidenceEngine:
    def __init__(self):
        self.evidence_log = []
        self.counter = 0

    def generate_evidence(self, event_type: str, raw_observations: Dict[str, Any]) -> EvidenceItem:
        self.counter += 1
        now = time.time()
        
        confidence = raw_observations.get("confidence", 0.8)
        severity = "high" if confidence > 0.9 else "medium"
        
        item = EvidenceItem(
            id=f"EV-{self.counter}",
            event_type=event_type,
            supporting_signals=list(raw_observations.keys()),
            start_time=now - 5.0,
            end_time=now,
            confidence=confidence,
            severity=severity,
            resolution="unresolved"
        )
        self.evidence_log.append(item)
        return item

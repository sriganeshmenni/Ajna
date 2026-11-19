from typing import Any, Dict
import logging

logger = logging.getLogger(__name__)

# Mock BaseEngine if not available
try:
    from eval_engine.core import BaseEngine
except ImportError:
    class BaseEngine:
        def __init__(self):
            self.events = []
        def emit(self, event_type: str, payload: Dict[str, Any]):
            self.events.append((event_type, payload))

class EventDetector(BaseEngine):
    EVENTS = [
        'face_absent', 'multiple_faces', 'identity_change', 
        'prolonged_gaze_deviation', 'additional_speaker', 
        'audio_anomaly', 'frame_departure'
    ]

    def __init__(self):
        super().__init__()
        self.thresholds = {
            'face_absent': 0.8,
            'multiple_faces': 0.7,
            'audio_anomaly': 0.9
        }

    def process(self, signals: Dict[str, float]):
        for event in self.EVENTS:
            val = signals.get(event, 0.0)
            thresh = self.thresholds.get(event, 0.85)
            
            if val > thresh:
                self.emit("PROCTORING_ALERT", {"event": event, "confidence": val})
                self.emit("EVIDENCE_CREATED", {"event": event, "type": "proctoring"})

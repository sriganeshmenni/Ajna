from dataclasses import dataclass
from typing import Dict, List, Tuple
import numpy as np

@dataclass
class ExpressionResult:
    action_units: Dict[str, float]
    smile_intensity: float
    brow_furrow: float
    eye_blink_left: float
    eye_blink_right: float
    mouth_open_ratio: float
    valence: float
    arousal: float

class ExpressionAnalyzer:
    def __init__(self):
        pass

    def compute_ear(self, eye_pts: List[Tuple[float, float]]) -> float:
        if len(eye_pts) != 6:
            return 0.0
        v1 = np.linalg.norm(np.array(eye_pts[1]) - np.array(eye_pts[5]))
        v2 = np.linalg.norm(np.array(eye_pts[2]) - np.array(eye_pts[4]))
        h = np.linalg.norm(np.array(eye_pts[0]) - np.array(eye_pts[3]))
        if h < 1e-6:
            return 0.0
        return float((v1 + v2) / (2.0 * h))

    def analyze(self, landmarks: List[Tuple[float, float]]) -> ExpressionResult:
        if len(landmarks) < 468:
            return ExpressionResult({}, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
            
        left_eye = [landmarks[i] for i in [33, 160, 158, 133, 153, 144]]
        right_eye = [landmarks[i] for i in [362, 385, 387, 263, 373, 380]]
        
        ear_left = self.compute_ear(left_eye)
        ear_right = self.compute_ear(right_eye)
        blink_left = 1.0 if ear_left < 0.2 else 0.0
        blink_right = 1.0 if ear_right < 0.2 else 0.0
        
        mouth_width = np.linalg.norm(np.array(landmarks[61]) - np.array(landmarks[291]))
        mouth_height = np.linalg.norm(np.array(landmarks[0]) - np.array(landmarks[17]))
        mouth_open_ratio = float(mouth_height / mouth_width) if mouth_width > 1e-6 else 0.0
        
        # Simple heuristics
        smile_intensity = float(max(0.0, min(1.0, (mouth_width - 100) / 100.0)))
        brow_furrow = 0.0
        
        valence = float(np.clip(smile_intensity * 0.8 - brow_furrow * 0.5, -1.0, 1.0))
        arousal = float(np.clip(mouth_open_ratio * 0.5 + (1.0 - min(ear_left, ear_right)) * 0.5, 0.0, 1.0))
        
        return ExpressionResult(
            action_units={"AU12": smile_intensity, "AU4": brow_furrow},
            smile_intensity=smile_intensity,
            brow_furrow=brow_furrow,
            eye_blink_left=blink_left,
            eye_blink_right=blink_right,
            mouth_open_ratio=mouth_open_ratio,
            valence=valence,
            arousal=arousal
        )

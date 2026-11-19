from dataclasses import dataclass
from typing import Tuple, List, Optional
import numpy as np

@dataclass
class GazeResult:
    gaze_vector: Tuple[float, float, float]
    deviation_angle: float
    left_iris_center: Tuple[float, float]
    right_iris_center: Tuple[float, float]
    is_looking_away: bool

class GazeEstimator:
    def __init__(self, deviation_threshold: float = 15.0):
        self.deviation_threshold = deviation_threshold

    def estimate(self, landmarks: List[Tuple[float, float]]) -> Optional[GazeResult]:
        """
        Estimates gaze from facial landmarks.
        Assumes MediaPipe face mesh landmarks are provided (468+ points).
        Left iris center ~ 468, Right iris center ~ 473.
        Left eye corners ~ 33, 133
        Right eye corners ~ 362, 263
        """
        if len(landmarks) < 478:
            return None
            
        left_eye_inner = np.array(landmarks[133])
        left_eye_outer = np.array(landmarks[33])
        right_eye_inner = np.array(landmarks[362])
        right_eye_outer = np.array(landmarks[263])
        
        left_iris = np.array(landmarks[468])
        right_iris = np.array(landmarks[473])
        
        left_eye_width = np.linalg.norm(left_eye_outer - left_eye_inner)
        right_eye_width = np.linalg.norm(right_eye_outer - right_eye_inner)
        
        if left_eye_width < 1e-6 or right_eye_width < 1e-6:
            return None
            
        gaze_x = ((left_iris[0] - left_eye_inner[0]) / left_eye_width) - 0.5
        gaze_y = ((left_iris[1] - left_eye_inner[1]) / left_eye_width) - 0.5
        gaze_z = -1.0 # Forward
        
        norm = np.sqrt(gaze_x**2 + gaze_y**2 + gaze_z**2)
        if norm < 1e-6:
            return None
            
        gaze_vector = (float(gaze_x/norm), float(gaze_y/norm), float(gaze_z/norm))
        
        dot_product = gaze_z / norm
        deviation_angle = float(np.degrees(np.arccos(np.clip(dot_product, -1.0, 1.0))))
        
        is_looking_away = deviation_angle > self.deviation_threshold
        
        return GazeResult(
            gaze_vector=gaze_vector,
            deviation_angle=deviation_angle,
            left_iris_center=(float(left_iris[0]), float(left_iris[1])),
            right_iris_center=(float(right_iris[0]), float(right_iris[1])),
            is_looking_away=is_looking_away
        )

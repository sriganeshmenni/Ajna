from dataclasses import dataclass
from typing import List, Tuple, Optional
import numpy as np
import cv2

@dataclass
class HeadPoseResult:
    yaw: float
    pitch: float
    roll: float
    yaw_velocity: float = 0.0
    pitch_velocity: float = 0.0
    roll_velocity: float = 0.0
    rotation_matrix: Optional[np.ndarray] = None

class HeadPoseEstimator:
    def __init__(self, alpha: float = 0.5):
        self.alpha = alpha
        self.prev_pose = None
        self.prev_time = 0.0
        
        # 3D canonical face model
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left Mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ], dtype=np.float32)

    def estimate(self, image_points: List[Tuple[float, float]], img_size: Tuple[int, int], timestamp: float = 0.0) -> Optional[HeadPoseResult]:
        if len(image_points) < 6:
            return None
            
        points_2d = np.array(image_points, dtype=np.float32)
        h, w = img_size
        
        focal_length = w
        center = (w / 2, h / 2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype=np.float32)
        dist_coeffs = np.zeros((4, 1))
        
        success, rotation_vec, translation_vec = cv2.solvePnP(
            self.model_points, points_2d, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )
        if not success:
            return None
            
        rmat, _ = cv2.Rodrigues(rotation_vec)
        
        sy = np.sqrt(rmat[0, 0] * rmat[0, 0] + rmat[1, 0] * rmat[1, 0])
        singular = sy < 1e-6
        if not singular:
            x = np.arctan2(rmat[2, 1], rmat[2, 2])
            y = np.arctan2(-rmat[2, 0], sy)
            z = np.arctan2(rmat[1, 0], rmat[0, 0])
        else:
            x = np.arctan2(-rmat[1, 2], rmat[1, 1])
            y = np.arctan2(-rmat[2, 0], sy)
            z = 0
            
        pitch = np.degrees(x)
        yaw = np.degrees(y)
        roll = np.degrees(z)
        
        # Smoothing and velocity
        yaw_vel = pitch_vel = roll_vel = 0.0
        if self.prev_pose is not None and timestamp > self.prev_time:
            dt = timestamp - self.prev_time
            if dt > 0:
                yaw_vel = (yaw - self.prev_pose[0]) / dt
                pitch_vel = (pitch - self.prev_pose[1]) / dt
                roll_vel = (roll - self.prev_pose[2]) / dt
            
            yaw = self.alpha * yaw + (1 - self.alpha) * self.prev_pose[0]
            pitch = self.alpha * pitch + (1 - self.alpha) * self.prev_pose[1]
            roll = self.alpha * roll + (1 - self.alpha) * self.prev_pose[2]
            
        self.prev_pose = (yaw, pitch, roll)
        self.prev_time = timestamp
        
        return HeadPoseResult(
            yaw=yaw, pitch=pitch, roll=roll,
            yaw_velocity=yaw_vel, pitch_velocity=pitch_vel, roll_velocity=roll_vel,
            rotation_matrix=rmat
        )

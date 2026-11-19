from typing import List, Dict, Any
import numpy as np

class SlidingWindow:
    def __init__(self, size: int):
        self.size = size
        self._data = []

    def append(self, item):
        self._data.append(item)
        if len(self._data) > self.size:
            self._data.pop(0)

    def __len__(self):
        return len(self._data)
        
    def __iter__(self):
        return iter(self._data)
        
    def __getitem__(self, idx):
        return self._data[idx]

class TemporalVisionExtractor:
    def __init__(self, window_size: int = 25):
        self.window_size = window_size
        self.history = SlidingWindow(size=window_size)
        
    def update(self, frame_data: Dict[str, Any]) -> List[str]:
        self.history.append(frame_data)
        events = []
        
        if len(self.history) < 2:
            return events
            
        current = self.history[-1]
        previous = self.history[-2]
        
        faces_curr = current.get('num_faces', 0)
        faces_prev = previous.get('num_faces', 0)
        
        if faces_curr == 0 and faces_prev > 0:
            events.append('FACE_LOST')
        if faces_curr > 1:
            events.append('MULTIPLE_FACES')
            
        gaze_curr = current.get('gaze_deviation', 0.0)
        if gaze_curr > 15.0:
            events.append('GAZE_DEVIATION')
            
        pose_curr = current.get('head_pose', (0.0, 0.0, 0.0))
        pose_prev = previous.get('head_pose', (0.0, 0.0, 0.0))
        if np.linalg.norm(np.array(pose_curr) - np.array(pose_prev)) > 10.0:
            events.append('HEAD_ORIENTATION_CHANGED')
            
        exp_curr = current.get('valence', 0.0)
        exp_prev = previous.get('valence', 0.0)
        if abs(exp_curr - exp_prev) > 0.3:
            events.append('EXPRESSION_CHANGED')
            
        return events

    def get_aggregated_features(self) -> Dict[str, float]:
        if len(self.history) == 0:
            return {}
        
        face_presence = sum(1 for f in self.history if f.get('num_faces', 0) > 0) / len(self.history)
        gaze_stability = 1.0 - np.mean([f.get('gaze_deviation', 0.0) / 90.0 for f in self.history])
        
        poses = [f.get('head_pose', (0,0,0)) for f in self.history]
        variance = float(np.var(poses)) if poses else 0.0
        
        return {
            'face_presence_ratio': float(face_presence),
            'gaze_stability_score': float(gaze_stability),
            'head_movement_variance': variance
        }

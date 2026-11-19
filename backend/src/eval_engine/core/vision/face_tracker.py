from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Optional, Tuple, Dict
import numpy as np

class TrackState(Enum):
    TENTATIVE = auto()
    CONFIRMED = auto()
    LOST = auto()

@dataclass
class TrackedFace:
    track_id: int
    bbox: Tuple[int, int, int, int]
    state: TrackState = TrackState.TENTATIVE
    hits: int = 1
    age: int = 1
    time_since_update: int = 0
    embedding: Optional[np.ndarray] = None

def compute_iou(boxA: Tuple[int, int, int, int], boxB: Tuple[int, int, int, int]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
    yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0

    boxAArea = boxA[2] * boxA[3]
    boxBArea = boxB[2] * boxB[3]
    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

class FaceTracker:
    def __init__(self, max_lost_age: int = 5, iou_threshold: float = 0.3):
        self.max_lost_age = max_lost_age
        self.iou_threshold = iou_threshold
        self.tracks: Dict[int, TrackedFace] = {}
        self.next_track_id = 0

    def update(self, detections: List[Tuple[Tuple[int, int, int, int], Optional[np.ndarray]]]) -> List[TrackedFace]:
        for track in self.tracks.values():
            track.time_since_update += 1
            track.age += 1

        unmatched_detections = list(range(len(detections)))
        unmatched_tracks = list(self.tracks.keys())
        
        matches = []
        if len(unmatched_detections) > 0 and len(unmatched_tracks) > 0:
            iou_matrix = np.zeros((len(unmatched_tracks), len(unmatched_detections)), dtype=np.float32)
            for t_idx, t_id in enumerate(unmatched_tracks):
                for d_idx, d in enumerate(detections):
                    iou_matrix[t_idx, d_idx] = compute_iou(self.tracks[t_id].bbox, d[0])
            
            for t_idx in range(len(unmatched_tracks)):
                d_idx = int(np.argmax(iou_matrix[t_idx]))
                if iou_matrix[t_idx, d_idx] >= self.iou_threshold:
                    if d_idx in unmatched_detections:
                        matches.append((unmatched_tracks[t_idx], d_idx))
                        unmatched_detections.remove(d_idx)
                        unmatched_tracks.remove(unmatched_tracks[t_idx])

        for t_id, d_idx in matches:
            track = self.tracks[t_id]
            track.bbox = detections[d_idx][0]
            if detections[d_idx][1] is not None:
                if track.embedding is not None:
                    # simplistic cosine dist check could go here for ID switch prevention
                    pass
                track.embedding = detections[d_idx][1]
            track.hits += 1
            track.time_since_update = 0
            if track.state == TrackState.TENTATIVE and track.hits >= 2:
                track.state = TrackState.CONFIRMED
            elif track.state == TrackState.LOST:
                track.state = TrackState.CONFIRMED

        for d_idx in unmatched_detections:
            self.tracks[self.next_track_id] = TrackedFace(
                track_id=self.next_track_id,
                bbox=detections[d_idx][0],
                embedding=detections[d_idx][1]
            )
            self.next_track_id += 1

        to_remove = []
        for t_id, track in self.tracks.items():
            if track.time_since_update > 0:
                if track.state == TrackState.TENTATIVE:
                    to_remove.append(t_id)
                elif track.time_since_update > self.max_lost_age:
                    to_remove.append(t_id)
                else:
                    track.state = TrackState.LOST

        for t_id in to_remove:
            del self.tracks[t_id]

        return [t for t in self.tracks.values() if t.state != TrackState.TENTATIVE]

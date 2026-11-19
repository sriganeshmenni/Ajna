import time
import numpy as np
import cv2
from typing import Union, Dict, Any, List

class BaseEngine:
    """Mock BaseEngine to allow successful import if not yet defined."""
    def __init__(self, *args, **kwargs):
        pass
    def initialize(self):
        pass
    def shutdown(self):
        pass

# Attempt to import real base components
try:
    from eval_engine.core import BaseEngine as RealBaseEngine
    BaseEngine = RealBaseEngine
except ImportError:
    pass

class VisionObservation:
    def __init__(self, **kwargs):
        self.timestamp = kwargs.get('timestamp', 0.0)
        self.processed = kwargs.get('processed', True)
        self.faces_detected = kwargs.get('faces_detected', 0)
        self.face_count = kwargs.get('face_count', self.faces_detected)
        self.face_present_probability = kwargs.get('face_present_probability', 1.0 if self.faces_detected > 0 else 0.0)
        self.head_pose = kwargs.get('head_pose', None)
        self.gaze = kwargs.get('gaze', None)
        self.expression = kwargs.get('expression', None)
        self.temporal_features = kwargs.get('temporal_features', {})
        self.events = kwargs.get('events', [])
        for k, v in kwargs.items():
            setattr(self, k, v)

from .adaptive_sampler import AdaptiveFrameSampler
from .face_detector import FaceDetector
from .face_tracker import FaceTracker
from .head_pose import HeadPoseEstimator
from .gaze_estimator import GazeEstimator
from .expression_dynamics import ExpressionAnalyzer
from .temporal_features import TemporalVisionExtractor

class VisionEngine(BaseEngine):
    def __init__(self, event_bus=None):
        super().__init__()
        self.event_bus = event_bus
        self.sampler = AdaptiveFrameSampler()
        self.detector = FaceDetector()
        self.tracker = FaceTracker()
        self.pose_estimator = HeadPoseEstimator()
        self.gaze_estimator = GazeEstimator()
        self.expression_analyzer = ExpressionAnalyzer()
        self.temporal_extractor = TemporalVisionExtractor()
        
    def initialize(self):
        """Loads models and components."""
        pass
        
    def process(self, data: Union[bytes, np.ndarray, Dict[str, Any]]) -> VisionObservation:
        timestamp = time.time()
        
        if not self.sampler.should_process(timestamp):
            return VisionObservation(timestamp=timestamp, processed=False)
            
        frame = None
        if isinstance(data, bytes):
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif isinstance(data, np.ndarray):
            frame = data
        elif isinstance(data, dict) and 'image' in data:
            frame = data['image']
            
        if frame is None:
            return VisionObservation(timestamp=timestamp, processed=False, error="Invalid input")

        detections = self.detector.detect(frame)
        
        tracker_input = [(d.bbox, d.embedding) for d in detections]
        tracked_faces = self.tracker.update(tracker_input)
        
        head_pose = None
        gaze = None
        expression = None
        
        if detections and detections[0].landmarks and len(detections[0].landmarks) >= 468:
            landmarks = detections[0].landmarks
            pts_6 = [landmarks[1], landmarks[152], landmarks[33], landmarks[263], landmarks[61], landmarks[291]]
            h, w = frame.shape[:2]
            head_pose = self.pose_estimator.estimate(pts_6, (h, w), timestamp)
            gaze = self.gaze_estimator.estimate(landmarks)
            expression = self.expression_analyzer.analyze(landmarks)
        elif detections:
            # Robust geometric landmark synthesis from detected face bbox (OpenCV Haar fallback)
            d = detections[0]
            bx, by, bw, bh = d.bbox
            h, w = frame.shape[:2]
            pts_6 = [
                (float(bx + bw * 0.5), float(by + bh * 0.55)),   # Nose tip
                (float(bx + bw * 0.5), float(by + bh * 0.95)),   # Chin
                (float(bx + bw * 0.25), float(by + bh * 0.35)),  # Left eye corner
                (float(bx + bw * 0.75), float(by + bh * 0.35)),  # Right eye corner
                (float(bx + bw * 0.30), float(by + bh * 0.75)),  # Left mouth corner
                (float(bx + bw * 0.70), float(by + bh * 0.75)),  # Right mouth corner
            ]
            head_pose = self.pose_estimator.estimate(pts_6, (h, w), timestamp)
            # Approximate gaze deviation relative to frame center
            fc_x = (bx + bw / 2.0) - (w / 2.0)
            fc_y = (by + bh / 2.0) - (h / 2.0)
            dev_deg = float(np.degrees(np.arctan2(np.sqrt(fc_x**2 + fc_y**2), w)))
            class GazeFallback:
                def __init__(self, dev):
                    self.deviation_angle = dev
                    self.is_looking_away = dev > 15.0
            gaze = GazeFallback(dev_deg)
                
        frame_data = {
            'num_faces': len(tracked_faces),
            'gaze_deviation': gaze.deviation_angle if gaze else 0.0,
            'head_pose': (head_pose.yaw, head_pose.pitch, head_pose.roll) if head_pose else (0.0, 0.0, 0.0),
            'valence': expression.valence if expression else 0.0
        }
        
        events = self.temporal_extractor.update(frame_data)
        if self.event_bus:
            for event in events:
                self.event_bus.publish('vision_event', event)
                
        motion_detected = False
        if head_pose and (abs(head_pose.yaw_velocity) > 10 or abs(head_pose.pitch_velocity) > 10):
            motion_detected = True
            
        faces_count = len(tracked_faces) if len(tracked_faces) > 0 else len(detections)
        state_stable = len(events) == 0
        self.sampler.update_target_fps(faces_count > 0, state_stable, motion_detected)
        
        aggr_features = self.temporal_extractor.get_aggregated_features()
        
        return VisionObservation(
            timestamp=timestamp,
            processed=True,
            faces_detected=faces_count,
            face_count=faces_count,
            face_present_probability=1.0 if faces_count > 0 else 0.0,
            head_pose=head_pose,
            gaze=gaze,
            expression=expression,
            temporal_features=aggr_features,
            events=events
        )

    def shutdown(self):
        """Releases vision resources."""
        pass

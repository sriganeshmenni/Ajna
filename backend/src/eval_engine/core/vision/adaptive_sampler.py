import time

class AdaptiveFrameSampler:
    """
    Dynamically adjusts the frame sampling rate based on state changes.
    """
    def __init__(self, base_fps: float = 5.0, min_fps: float = 3.0, max_fps: float = 15.0):
        self.base_fps = base_fps
        self.min_fps = min_fps
        self.max_fps = max_fps
        self.current_fps = base_fps
        self.last_processed_time = 0.0

    def should_process(self, timestamp: float) -> bool:
        """
        Determines if a frame should be processed based on the current target FPS.
        """
        if self.current_fps <= 0:
            return False
        
        interval = 1.0 / self.current_fps
        if (timestamp - self.last_processed_time) >= interval:
            self.last_processed_time = timestamp
            return True
        return False

    def update_target_fps(self, face_detected: bool, state_stable: bool, motion_detected: bool) -> float:
        """
        Adjusts frame rate adaptively.
        """
        if not face_detected:
            self.current_fps = self.min_fps
        elif motion_detected or not state_stable:
            self.current_fps = self.max_fps
        else:
            self.current_fps = self.base_fps
            
        return self.current_fps

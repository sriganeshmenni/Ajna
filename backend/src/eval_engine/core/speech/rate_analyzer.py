import numpy as np
from typing import List, Tuple
from eval_engine.models.report import TranscriptionSegment

class SpeakingRateAnalyzer:
    def __init__(self, z_score_threshold: float = 2.0):
        self.z_score_threshold = z_score_threshold
        self.historical_rates = []
        self.total_words = 0
        self.total_speech_time = 0.0
        self.total_session_time = 0.0
        
    def analyze(self, segments: List[TranscriptionSegment], session_time_elapsed: float) -> Tuple[dict, List[str]]:
        events = []
        if not segments:
            return {}, events
            
        segment_words = 0
        segment_duration = 0.0
        
        for seg in segments:
            count = len(seg.words) if getattr(seg, 'words', None) else len((getattr(seg, 'text', '') or '').split())
            dur = (getattr(seg, 'end', 0.0) - getattr(seg, 'start', 0.0))
            if dur <= 0:
                dur = max(0.4, count * 0.35)
            segment_words += count
            segment_duration += dur
            
        self.total_words += segment_words
        self.total_speech_time += segment_duration
        self.total_session_time = max(self.total_session_time, session_time_elapsed)
        
        if segment_duration > 0 and segment_words > 0:
            current_wpm = (segment_words / segment_duration) * 60
            self.historical_rates.append(current_wpm)
            
            # Calculate standard deviation and z-score
            if len(self.historical_rates) > 5:
                mean_wpm = np.mean(self.historical_rates[:-1])
                std_wpm = np.std(self.historical_rates[:-1])
                
                if std_wpm > 0:
                    z_score = abs(current_wpm - mean_wpm) / std_wpm
                    if z_score > self.z_score_threshold:
                        events.append("RATE_CHANGED")
        
        overall_wpm = (self.total_words / self.total_speech_time) * 60 if self.total_speech_time > 0 else 0
        speaking_time_ratio = (self.total_speech_time / self.total_session_time) if self.total_session_time > 0 else 0
        
        # Mock calculation for pause-adjusted WPM (treating a fixed percentage as pauses for this implementation)
        pause_adjusted_wpm = overall_wpm * 1.1
        
        rate_variability = float(np.std(self.historical_rates)) if len(self.historical_rates) > 1 else 0.0
        
        metrics = {
            "wpm": overall_wpm,
            "pause_adjusted_wpm": pause_adjusted_wpm,
            "speaking_time_ratio": speaking_time_ratio,
            "rate_variability": rate_variability,
            "current_segment_wpm": (segment_words / segment_duration) * 60 if segment_duration > 0 else 0
        }
        
        return metrics, events

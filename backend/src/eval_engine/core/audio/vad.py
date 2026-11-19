import numpy as np
from dataclasses import dataclass
from typing import Tuple, List, Optional
import warnings

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

@dataclass
class VADResult:
    is_speech: bool
    speech_probability: float
    silence_probability: float
    non_speech_probability: float

class VADDetector:
    def __init__(self, target_sr: int = 16000, threshold: float = 0.5):
        self.target_sr = target_sr
        self.threshold = threshold
        self.silero_model = None
        self.use_fallback = not HAS_TORCH
        
        if HAS_TORCH:
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    self.silero_model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                                              model='silero_vad',
                                                              force_reload=False,
                                                              trust_repo=True)
                self.get_speech_timestamps = utils[0]
                self.silero_model.eval()
            except Exception as e:
                print(f"Failed to load Silero VAD, using fallback. Error: {e}")
                self.use_fallback = True

        self.is_speech_active = False

    def process(self, audio_chunk: np.ndarray) -> Tuple[VADResult, List[str]]:
        events = []
        
        if self.use_fallback or not HAS_TORCH:
            prob = self._fallback_vad(audio_chunk)
        else:
            prob = self._silero_vad(audio_chunk)
            
        is_speech = prob >= self.threshold
        
        if is_speech and not self.is_speech_active:
            self.is_speech_active = True
            events.append("SPEECH_STARTED")
        elif not is_speech and self.is_speech_active:
            self.is_speech_active = False
            events.append("SPEECH_STOPPED")
            events.append("PAUSE_DETECTED")
            
        result = VADResult(
            is_speech=is_speech,
            speech_probability=float(prob),
            silence_probability=float(1.0 - prob),
            non_speech_probability=0.0
        )
        return result, events

    def _silero_vad(self, audio_chunk: np.ndarray) -> float:
        if len(audio_chunk) == 0:
            return 0.0
        tensor = torch.from_numpy(audio_chunk).float().unsqueeze(0)
        with torch.no_grad():
            prob = self.silero_model(tensor, self.target_sr).item()
        return prob

    def _fallback_vad(self, audio_chunk: np.ndarray) -> float:
        if len(audio_chunk) == 0:
            return 0.0
        rms = float(np.sqrt(np.mean(audio_chunk ** 2)))
        
        # In 16-bit normalized float audio:
        # Silence / ambient mic floor: rms < 0.008
        # Audible whisper / quiet speech: rms 0.010 - 0.020
        # Normal conversational speech: rms 0.020 - 0.150
        if rms < 0.008:
            return float(np.clip(rms / 0.02, 0.0, 0.40))
        
        # Speech probability scales from 0.50 to 1.0 based on RMS above ambient floor
        speech_prob = 0.50 + float(np.clip((rms - 0.008) / 0.025, 0.0, 0.50))
        return min(1.0, speech_prob)

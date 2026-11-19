import numpy as np
from typing import Tuple, Union

try:
    import librosa
except ImportError:
    librosa = None

try:
    from scipy import signal as scipy_signal
except ImportError:
    scipy_signal = None

class AudioPreprocessor:
    def __init__(self, target_sr: int = 16000, pre_emphasis_alpha: float = 0.97):
        self.target_sr = target_sr
        self.alpha = pre_emphasis_alpha
        
        # State for running SNR
        self.noise_estimate_initialized = False
        self.noise_power = 1e-10

    def process(self, audio: Union[bytes, np.ndarray], sample_rate: int = 16000) -> Tuple[np.ndarray, dict]:
        """
        Processes incoming audio chunk:
        - Resamples to target_sr if needed
        - Removes DC offset
        - Applies pre-emphasis filter
        - Detects clipping and computes running SNR
        """
        if isinstance(audio, bytes):
            # Assuming 16-bit PCM mono
            audio_np = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            audio_np = audio.astype(np.float32)
            if len(audio_np) > 0 and (audio_np.max() > 1.0 or audio_np.min() < -1.0):
                audio_np = audio_np / 32768.0  # normalize if it's raw int range

        if len(audio_np) == 0:
            return np.zeros(0, dtype=np.float32), {"snr": 0.0, "is_clipped": False, "signal_power": 0.0}

        # Resample if necessary
        if sample_rate != self.target_sr:
            if librosa is not None:
                audio_np = librosa.resample(y=audio_np, orig_sr=sample_rate, target_sr=self.target_sr)
            elif scipy_signal is not None:
                num_samples = int(len(audio_np) * float(self.target_sr) / sample_rate)
                audio_np = scipy_signal.resample(audio_np, num_samples)

        # Clipping detection (before modifications)
        is_clipped = bool(np.any(np.abs(audio_np) >= 0.99))

        # DC offset removal
        audio_np = audio_np - np.mean(audio_np)

        # Pre-emphasis filter
        if len(audio_np) > 1:
            emphasized_audio = np.append(audio_np[0], audio_np[1:] - self.alpha * audio_np[:-1])
        else:
            emphasized_audio = audio_np

        # SNR computation
        signal_power = np.mean(audio_np ** 2)
        if not self.noise_estimate_initialized:
            self.noise_power = max(signal_power, 1e-10)
            self.noise_estimate_initialized = True
        else:
            if signal_power < self.noise_power:
                self.noise_power = 0.8 * self.noise_power + 0.2 * signal_power
        
        snr = 10 * np.log10(signal_power / self.noise_power) if signal_power > 0 else 0.0

        stats = {
            "snr": float(snr),
            "is_clipped": is_clipped,
            "signal_power": float(signal_power)
        }

        return emphasized_audio, stats

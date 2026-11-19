import numpy as np
import time
import logging
from typing import Dict, Any, List, Optional
from eval_engine.core import BaseEngine
from .asr_transcriber import ASRTranscriber
from .rate_analyzer import SpeakingRateAnalyzer
from .disfluency_detector import DisfluencyDetector

logger = logging.getLogger(__name__)

class SpeechEngine(BaseEngine):
    """
    Orchestrates real-time ASR transcription, speech rate cadence analysis,
    filler/disfluency detection, and answer completion event lifecycle.
    """
    def __init__(self, event_bus=None):
        super().__init__()
        self.event_bus = event_bus
        self.transcriber = ASRTranscriber(model_size="tiny.en")
        self.rate_analyzer = SpeakingRateAnalyzer()
        self.disfluency_detector = DisfluencyDetector()

        self.is_answering = False
        self.session_start_time = time.time()
        self.audio_buffer: List[np.ndarray] = []
        self.silence_frames = 0
        self.total_buffered_samples = 0
        self.max_buffer_samples = 16000 * 4  # 4 seconds max chunk for low latency

    def initialize(self):
        self.session_start_time = time.time()
        self.audio_buffer.clear()
        self.total_buffered_samples = 0
        self.silence_frames = 0

    def shutdown(self):
        self.audio_buffer.clear()

    def process(self, audio_chunk: np.ndarray, vad_active: bool) -> Dict[str, Any]:
        """
        Processes incoming 16kHz audio chunk with VAD state.
        Buffers speech and triggers ASR when a speech pause or buffer limit occurs.
        """
        events_emitted = []
        now = time.time()

        if len(audio_chunk) > 0:
            if audio_chunk.dtype != np.float32:
                audio_chunk = audio_chunk.astype(np.float32)
            if np.max(np.abs(audio_chunk)) > 1.0:
                audio_chunk = audio_chunk / 32768.0

        # State transition: Speech Started
        if vad_active and not self.is_answering:
            self.is_answering = True
            self.silence_frames = 0
            if self.event_bus:
                self.event_bus.publish("ANSWER_STARTED", {"timestamp": now})
            events_emitted.append("ANSWER_STARTED")

        if vad_active:
            self.silence_frames = 0
            if len(audio_chunk) > 0:
                self.audio_buffer.append(audio_chunk)
                self.total_buffered_samples += len(audio_chunk)
        else:
            if self.is_answering:
                self.silence_frames += 1

        # Trigger transcription if:
        # A) User paused speaking (VAD inactive for ~4 frames / 400ms with >= 0.5s speech)
        # B) OR speech buffer reached max threshold (4.0s of continuous speaking)
        should_flush = (self.is_answering and self.silence_frames >= 4 and self.total_buffered_samples >= 8000) or \
                       (self.total_buffered_samples >= self.max_buffer_samples)

        # Clear transient mic clicks / coughs that never reach 0.5s speech
        if self.is_answering and self.silence_frames >= 15 and self.total_buffered_samples < 8000:
            self.audio_buffer.clear()
            self.total_buffered_samples = 0
            self.silence_frames = 0
            self.is_answering = False

        if should_flush and self.audio_buffer:
            if self.silence_frames >= 4:
                self.is_answering = False
                if self.event_bus:
                    self.event_bus.publish("ANSWER_COMPLETED", {"timestamp": now})
                events_emitted.append("ANSWER_COMPLETED")

            full_audio = np.concatenate(self.audio_buffer)
            self.audio_buffer.clear()
            self.total_buffered_samples = 0
            self.silence_frames = 0

            # Execute faster-whisper transcription
            segments = self.transcriber.transcribe(full_audio)

            if segments:
                # Disfluency detection
                disfluency_stats, disfluency_events = self.disfluency_detector.detect(segments)
                events_emitted.extend(disfluency_events)

                # Rate analysis
                elapsed = max(1.0, now - self.session_start_time)
                rate_metrics, rate_events = self.rate_analyzer.analyze(segments, elapsed)
                events_emitted.extend(rate_events)

                # Mark filler words in each segment
                segments_data = []
                concatenated_text = []

                for seg in segments:
                    seg_dict = seg.model_dump() if hasattr(seg, 'model_dump') else seg.__dict__
                    words_enriched = []
                    for w in seg_dict.get("words", []):
                        w_text = w.get("word", "").lower().strip(",.?!")
                        is_filler = w_text in self.disfluency_detector.filler_words
                        words_enriched.append({
                            **w,
                            "is_filler": is_filler
                        })
                    seg_dict["words"] = words_enriched
                    segments_data.append(seg_dict)
                    concatenated_text.append(seg.text)

                return {
                    "status": "transcription_complete",
                    "text": " ".join(concatenated_text),
                    "segments": segments_data,
                    "wpm": rate_metrics.get("wpm", 140.0),
                    "rate_metrics": rate_metrics,
                    "disfluency_metrics": disfluency_stats,
                    "events": list(set(events_emitted))
                }

        return {
            "status": "buffering" if self.is_answering else "idle",
            "is_speech": vad_active,
            "events": events_emitted
        }

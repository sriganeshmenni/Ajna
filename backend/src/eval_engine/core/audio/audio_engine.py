from eval_engine.core import BaseEngine
from .preprocessor import AudioPreprocessor
from .vad import VADDetector
from .acoustic_features import AcousticFeatureExtractor
from .speaker_analyzer import SpeakerAnalyzer

class AudioEngine(BaseEngine):
    def __init__(self, event_bus):
        super().__init__(event_bus)
        self.preprocessor = AudioPreprocessor()
        self.vad = VADDetector()
        self.feature_extractor = AcousticFeatureExtractor()
        self.speaker_analyzer = SpeakerAnalyzer()

    def process(self, audio_chunk: bytes) -> dict:
        """
        Process incoming raw audio chunk, orchestrate sub-components,
        and publish events.
        """
        processed_audio, preprocessor_stats = self.preprocessor.process(audio_chunk)
        
        # 1. VAD
        vad_result, vad_events = self.vad.process(processed_audio)
        for event in vad_events:
            self.event_bus.publish(event, {"source": "audio_engine"})
            
        if not vad_result.is_speech:
            return {
                "status": "processed",
                "speech_active": False,
                "preprocessor_stats": preprocessor_stats,
                "vad_result": vad_result.__dict__
            }
            
        # 2. Acoustic Features
        features = self.feature_extractor.extract(processed_audio)
        
        # 3. Speaker Analysis
        speaker_result, speaker_events = self.speaker_analyzer.analyze(features)
        for event in speaker_events:
            self.event_bus.publish(event, {"speaker_id": speaker_result.speaker_id})
            
        # Combine results
        result = {
            "status": "processed",
            "speech_active": True,
            "preprocessor_stats": preprocessor_stats,
            "vad_result": vad_result.__dict__,
            "features": features.__dict__,
            "speaker_analysis": speaker_result.__dict__
        }
        
        self.event_bus.publish("AUDIO_CHUNK_PROCESSED", result)
        
        return result

import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional
from eval_engine.models.report import AcousticFeatures

@dataclass
class SpeakerResult:
    candidate_voice_probability: float
    other_speaker_probability: float
    speaker_id: str
    embedding: List[float]

class SpeakerAnalyzer:
    def __init__(self, similarity_threshold: float = 0.75):
        self.enrolled_embedding: Optional[np.ndarray] = None
        self.similarity_threshold = similarity_threshold
        self.is_enrolled = False
        self.enrollment_chunks = []
        self.max_enrollment_chunks = 5
        
    def _extract_embedding(self, acoustic_features: AcousticFeatures) -> np.ndarray:
        # Dummy implementation of speaker embedding based on acoustic features
        # In a real system, a dedicated model (e.g. SpeechBrain ECAPA-TDNN) would be used
        vec = np.array([
            acoustic_features.pitch_f0,
            acoustic_features.spectral_centroid,
            *acoustic_features.mfccs
        ])
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def analyze(self, acoustic_features: AcousticFeatures) -> Tuple[SpeakerResult, List[str]]:
        events = []
        embedding = self._extract_embedding(acoustic_features)
        
        if not self.is_enrolled:
            self.enrollment_chunks.append(embedding)
            if len(self.enrollment_chunks) >= self.max_enrollment_chunks:
                self.enrolled_embedding = np.mean(self.enrollment_chunks, axis=0)
                self.enrolled_embedding /= np.linalg.norm(self.enrolled_embedding)
                self.is_enrolled = True
                
            return SpeakerResult(
                candidate_voice_probability=1.0,
                other_speaker_probability=0.0,
                speaker_id="candidate",
                embedding=embedding.tolist()
            ), events

        # Compare with enrolled profile using cosine similarity
        similarity = float(np.dot(embedding, self.enrolled_embedding))
        
        candidate_prob = max(0.0, min(1.0, (similarity + 1.0) / 2.0))
        other_prob = 1.0 - candidate_prob
        
        speaker_id = "candidate"
        if similarity < self.similarity_threshold:
            speaker_id = "unknown"
            events.append("OTHER_SPEAKER_DETECTED")
            
        return SpeakerResult(
            candidate_voice_probability=candidate_prob,
            other_speaker_probability=other_prob,
            speaker_id=speaker_id,
            embedding=embedding.tolist()
        ), events

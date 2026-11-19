from pydantic import BaseModel, Field
from typing import Any

class HeadPose(BaseModel):
    """Euler angles for head pose estimation."""
    yaw: float
    pitch: float
    roll: float

class VisionObservation(BaseModel):
    """Consolidated vision observation report block."""
    face_present_probability: float
    face_count: int
    face_count_probability: float
    head_orientation: HeadPose | None = None
    gaze_deviation_angle: float | None = None
    frame_presence_ratio: float
    tracking_confidence: float
    identity_consistency: float
    expression_features: dict[str, float] = Field(default_factory=dict)
    visual_events: list[str] = Field(default_factory=list)

class AcousticFeatures(BaseModel):
    """Extracted acoustic features from audio chunks."""
    f0: float
    f0_confidence: float
    pitch_contour: list[float]
    pitch_range: float
    rms_energy: float
    spectral_centroid: float
    spectral_bandwidth: float
    spectral_rolloff: float
    zcr: float
    hnr: float
    mfccs: list[float]
    jitter: float
    shimmer: float

class TranscriptionSegment(BaseModel):
    """Transcription of speech segment."""
    text: str
    words: list[dict[str, Any]] = Field(default_factory=list)
    language: str = "en"
    language_probability: float = 0.99
    avg_logprob: float = -0.25
    no_speech_prob: float = 0.02
    start: float = 0.0
    end: float = 0.0
    speaker: str = "CANDIDATE"

class SpeakingRateAnalysis(BaseModel):
    """Analysis of candidate's speaking pace."""
    wpm: float
    pause_adjusted_wpm: float
    rate_variability: float
    speaking_time_ratio: float

class ConceptAnalysis(BaseModel):
    """Analysis of expected domain concepts in candidate response."""
    question: str
    expected_concepts: list[str]
    mentioned_concepts: list[str]
    missing_concepts: list[str]
    incorrect_concepts: list[str]
    extra_concepts: list[str]
    concept_coverage: float
    semantic_coverage: float

class AnswerEvaluation(BaseModel):
    """Evaluation of a specific answer to a question."""
    question_id: str
    question_text: str
    answer_text: str
    relevance_score: float
    completeness_score: float
    technical_correctness: float
    coherence_score: float
    vocabulary_richness: float
    grammar_quality: float
    asr_confidence: float
    evidence: list[str] = Field(default_factory=list)

class StateEstimate(BaseModel):
    """Estimation of the candidate's overarching state or behavior trend."""
    timestamp: float
    states: dict[str, float]
    dominant_state: str
    dominant_confidence: float
    state_entropy: float
    trend: str
    window_duration: float

class ProctoringEvent(BaseModel):
    """An alert or recorded event relating to proctoring or integrity."""
    event_type: str
    timestamp: float
    duration: float
    probability: float
    source: str
    supporting_signals: list[Any] = Field(default_factory=list)
    severity: str
    evidence_reference: str = ""
    description: str = ""

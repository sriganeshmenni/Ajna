import logging
from typing import Any, Dict, List
from ...core.base import BaseEngine
from .answer_evaluator import AnswerEvaluator, AnswerEvaluation

logger = logging.getLogger(__name__)

# Mock BaseEngine if not available in context
try:
    from eval_engine.core import BaseEngine
except ImportError:
    class BaseEngine:
        def __init__(self):
            self.events = []
        def emit(self, event_type: str, payload: Dict[str, Any]):
            self.events.append((event_type, payload))

class NLPEngine(BaseEngine):
    def __init__(self):
        super().__init__()
        self.evaluator = AnswerEvaluator()
        self.segments_buffer = []
        self.current_question = ""
        self.expected_concepts = []

    def set_context(self, question: str, expected_concepts: List[str]):
        self.current_question = question
        self.expected_concepts = expected_concepts
        self.segments_buffer = []

    def process_segment(self, segment: str, asr_confidence: float = 1.0):
        self.segments_buffer.append(segment)
        full_answer = " ".join(self.segments_buffer)
        
        eval_result = self.evaluator.evaluate(
            question=self.current_question,
            expected_concepts=self.expected_concepts,
            answer=full_answer,
            asr_confidence=asr_confidence
        )
        
        # Emit technical concepts discovered
        for concept in eval_result.concept_analysis.mentioned:
            self.emit("TECHNICAL_CONCEPT", {
                "concept": concept,
                "context": full_answer
            })
            
        return eval_result

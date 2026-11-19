from typing import List, Optional
from pydantic import BaseModel
from .semantic_analyzer import SemanticAnalyzer
from .concept_extractor import ConceptExtractor, ConceptAnalysis
from .grammar_checker import GrammarChecker
from .vocabulary_analyzer import VocabularyAnalyzer
from .question_classifier import QuestionClassifier

class AnswerEvaluation(BaseModel):
    relevance_score: float
    coherence_score: float
    grammar_error_rate: float
    ttr: float
    technical_richness: float
    concept_analysis: ConceptAnalysis
    question_type: str

class AnswerEvaluator:
    def __init__(self):
        self.semantic = SemanticAnalyzer()
        self.concept = ConceptExtractor()
        self.grammar = GrammarChecker()
        self.vocab = VocabularyAnalyzer()
        self.classifier = QuestionClassifier()

    def evaluate(self, question: str, expected_concepts: List[str], answer: str, asr_confidence: float = 1.0) -> AnswerEvaluation:
        q_type = self.classifier.classify(question)
        
        # Split answer into pseudo-sentences
        sentences = [s.strip() for s in answer.split('.') if s.strip()]
        
        coherence = self.semantic.compute_coherence(sentences)
        relevance = self.semantic.compute_relevance(answer, " ".join(expected_concepts))
        
        concept_res = self.concept.analyze(answer, expected_concepts)
        grammar_res = self.grammar.check(answer, asr_confidence)
        vocab_res = self.vocab.analyze(answer)
        
        return AnswerEvaluation(
            relevance_score=relevance,
            coherence_score=coherence,
            grammar_error_rate=grammar_res["error_rate"],
            ttr=vocab_res["ttr"],
            technical_richness=vocab_res["technical_richness"],
            concept_analysis=concept_res,
            question_type=q_type
        )

import re
from typing import List, Set
from pydantic import BaseModel

class ConceptAnalysis(BaseModel):
    expected: List[str]
    mentioned: List[str]
    missing: List[str]
    extra: List[str]
    concept_coverage_ratio: float
    soft_semantic_coverage_ratio: float

class ConceptExtractor:
    def __init__(self):
        # Fallback regex if spacy is not used/available for simple extraction
        self.word_pattern = re.compile(r'\b\w+\b', re.IGNORECASE)

    def extract_concepts(self, text: str) -> Set[str]:
        # Simple heuristic fallback for concept extraction
        words = set(self.word_pattern.findall(text.lower()))
        stopwords = {"the", "a", "an", "is", "and", "or", "to", "in", "of", "for", "with", "on", "by", "this", "that"}
        return {w for w in words if w not in stopwords and len(w) > 2}

    def analyze(self, answer_text: str, expected_concepts: List[str]) -> ConceptAnalysis:
        expected_set = set(c.lower() for c in expected_concepts)
        mentioned_set = self.extract_concepts(answer_text)
        
        found = expected_set.intersection(mentioned_set)
        missing = expected_set.difference(mentioned_set)
        extra = mentioned_set.difference(expected_set)
        
        coverage = len(found) / len(expected_set) if expected_set else 1.0
        
        # Mock soft semantic coverage for now, can integrate SemanticAnalyzer later
        soft_coverage = min(1.0, coverage + 0.1) if coverage < 1.0 else 1.0

        return ConceptAnalysis(
            expected=list(expected_set),
            mentioned=list(found),
            missing=list(missing),
            extra=list(extra),
            concept_coverage_ratio=coverage,
            soft_semantic_coverage_ratio=soft_coverage
        )

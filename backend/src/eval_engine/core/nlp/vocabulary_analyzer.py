import re
from typing import Dict

class VocabularyAnalyzer:
    def __init__(self):
        self.word_pattern = re.compile(r'\b\w+\b', re.IGNORECASE)

    def analyze(self, text: str) -> Dict[str, float]:
        words = self.word_pattern.findall(text.lower())
        total_tokens = len(words)
        
        if total_tokens == 0:
            return {
                "ttr": 0.0,
                "lexical_diversity": 0.0,
                "technical_richness": 0.0
            }

        unique_types = set(words)
        ttr = len(unique_types) / total_tokens
        
        # Simple heuristic for long words as proxy for technical richness
        long_words = [w for w in unique_types if len(w) > 6]
        tech_richness = len(long_words) / total_tokens

        return {
            "ttr": ttr,
            "lexical_diversity": ttr * 100, # scaled
            "technical_richness": tech_richness
        }

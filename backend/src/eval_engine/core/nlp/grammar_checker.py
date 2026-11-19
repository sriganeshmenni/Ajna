import re
from typing import Dict, Any

class GrammarChecker:
    def __init__(self):
        # Basic heuristic rules
        self.rules = [
            (re.compile(r'\b(i|he|she|it)\s+(are|were)\b', re.IGNORECASE), "Subject-verb agreement error"),
            (re.compile(r'\b(you|we|they)\s+(is|was)\b', re.IGNORECASE), "Subject-verb agreement error"),
            (re.compile(r'\b(a)\s+[aeiou]\w+', re.IGNORECASE), "Article error"),
            (re.compile(r'\b(an)\s+[^aeiou]\w+', re.IGNORECASE), "Article error")
        ]

    def check(self, text: str, asr_confidence: float = 1.0) -> Dict[str, Any]:
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)
        
        if word_count == 0:
            return {"error_rate": 0.0, "errors": []}

        errors = []
        for pattern, desc in self.rules:
            matches = pattern.finditer(text)
            for match in matches:
                errors.append({"text": match.group(), "description": desc})

        raw_error_rate = len(errors) / word_count
        # Penalize less if ASR confidence is low
        normalized_error_rate = raw_error_rate * asr_confidence

        return {
            "error_rate": normalized_error_rate,
            "error_count": len(errors),
            "errors": errors
        }

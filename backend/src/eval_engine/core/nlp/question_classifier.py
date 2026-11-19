from typing import List

class QuestionClassifier:
    def __init__(self):
        self.technical_keywords = {"how", "explain", "what is", "architecture", "design", "algorithm", "code"}
        self.behavioral_keywords = {"tell me about a time", "conflict", "disagreement", "team", "challenge"}
        self.communication_keywords = {"present", "pitch", "explain to a non-technical"}

    def classify(self, question: str) -> str:
        q_lower = question.lower()
        
        for kw in self.behavioral_keywords:
            if kw in q_lower:
                return "behavioral"
                
        for kw in self.communication_keywords:
            if kw in q_lower:
                return "communication"
                
        for kw in self.technical_keywords:
            if kw in q_lower:
                return "technical"
                
        return "general"

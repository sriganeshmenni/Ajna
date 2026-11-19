import numpy as np
from typing import List, Optional
import math
import re

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

class SemanticAnalyzer:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.vectorizer = None
        self.model = None
        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.model = SentenceTransformer(model_name)
            except Exception:
                pass
        
        if not self.model and HAS_SKLEARN:
            self.vectorizer = TfidfVectorizer()

    def get_embedding(self, text: str) -> np.ndarray:
        if self.model:
            return self.model.encode(text)
        elif self.vectorizer and HAS_SKLEARN:
            try:
                return self.vectorizer.fit_transform([text]).toarray()[0]
            except Exception:
                pass
        
        # Pure Python word bag embedding
        words = re.findall(r'\w+', text.lower())
        vec = np.zeros(128)
        for w in words:
            idx = sum(ord(c) for c in w) % 128
            vec[idx] += 1.0
        return vec

    def compute_similarity(self, text1: str, text2: str) -> float:
        if not text1.strip() or not text2.strip():
            return 0.0

        if self.model:
            emb1 = self.get_embedding(text1)
            emb2 = self.get_embedding(text2)
            norm = (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            if norm == 0:
                return 0.0
            return float(np.dot(emb1, emb2) / norm)
        elif HAS_SKLEARN and self.vectorizer:
            try:
                tfidf = self.vectorizer.fit_transform([text1, text2])
                return float(sklearn_cosine(tfidf[0:1], tfidf[1:2])[0][0])
            except Exception:
                pass

        # Fallback pure-python word set Jaccard + Cosine calculation
        words1 = set(re.findall(r'\w+', text1.lower()))
        words2 = set(re.findall(r'\w+', text2.lower()))
        if not words1 or not words2:
            return 0.0

        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        jaccard = intersection / max(1, union)
        cosine = intersection / math.sqrt(len(words1) * len(words2))

        return float(round((0.5 * jaccard) + (0.5 * cosine), 2))

    def compute_coherence(self, sentences: List[str]) -> float:
        if len(sentences) < 2:
            return 1.0
        similarities = []
        for i in range(len(sentences) - 1):
            similarities.append(self.compute_similarity(sentences[i], sentences[i+1]))
        return float(np.mean(similarities))

    def compute_relevance(self, answer: str, expected_answer: str) -> float:
        return self.compute_similarity(answer, expected_answer)

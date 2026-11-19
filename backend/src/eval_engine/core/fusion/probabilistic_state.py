import math
from typing import Dict, List
from pydantic import BaseModel

class StateEstimate(BaseModel):
    dominant_state: str
    probabilities: Dict[str, float]
    entropy: float
    trend: str

class ProbabilisticStateEngine:
    def __init__(self):
        self.states = ['focus', 'distraction', 'stress', 'cognitive_load']
        self.prior = {s: 1.0/len(self.states) for s in self.states}

    def update(self, likelihoods: Dict[str, float]) -> StateEstimate:
        posterior = {}
        total = 0.0
        
        for state in self.states:
            post = self.prior[state] * likelihoods.get(state, 1.0)
            posterior[state] = post
            total += post
            
        if total > 0:
            for state in self.states:
                posterior[state] /= total
                self.prior[state] = posterior[state] # Update prior
                
        entropy = -sum(p * math.log2(p) for p in posterior.values() if p > 0)
        dominant = max(posterior.items(), key=lambda x: x[1])[0]
        
        return StateEstimate(
            dominant_state=dominant,
            probabilities=posterior,
            entropy=entropy,
            trend="stable" # placeholder for trend analysis
        )

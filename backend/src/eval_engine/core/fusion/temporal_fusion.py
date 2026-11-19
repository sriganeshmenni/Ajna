import time
from typing import Dict, List, Optional

class TemporalFusionEngine:
    STATES = ['steady', 'hesitant', 'rushed', 'disengaged', 'absent']
    
    def __init__(self):
        self.current_state = 'steady'
        self.history = []
        # basic HMM transition matrix mock
        self.transitions = {s: {s2: 0.2 for s2 in self.STATES} for s in self.STATES}
        for s in self.STATES:
            self.transitions[s][s] = 0.8
            
        self.windows = {
            'short_term': 5,
            'medium_term': 30,
            'session': float('inf')
        }

    def update(self, observations: Dict[str, float]) -> str:
        timestamp = time.time()
        self.history.append((timestamp, observations))
        
        # Simple heuristic state update based on observations
        energy = observations.get('energy', 0.5)
        attention = observations.get('attention', 0.8)
        
        if attention < 0.2:
            next_state = 'absent'
        elif attention < 0.5:
            next_state = 'disengaged'
        elif energy > 0.8:
            next_state = 'rushed'
        elif energy < 0.3:
            next_state = 'hesitant'
        else:
            next_state = 'steady'
            
        self.current_state = next_state
        return self.current_state
        
    def get_window_stats(self, window_name: str) -> Dict[str, float]:
        if window_name not in self.windows:
            return {}
        duration = self.windows[window_name]
        now = time.time()
        
        relevant = [obs for ts, obs in self.history if (now - ts) <= duration]
        if not relevant:
            return {}
            
        avg_energy = sum(o.get('energy', 0) for o in relevant) / len(relevant)
        return {"avg_energy": avg_energy, "count": len(relevant)}

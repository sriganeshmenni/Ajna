import re
from typing import List, Tuple
from eval_engine.models.report import TranscriptionSegment

class DisfluencyDetector:
    def __init__(self):
        self.filler_words = {"um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of"}
        self.recent_words = []
        
    def detect(self, segments: List[TranscriptionSegment]) -> Tuple[dict, List[str]]:
        events = []
        fillers_detected = 0
        repetitions_detected = 0
        false_restarts = 0
        
        for seg in segments:
            # seg.words can be a list of dicts (e.g. {'word': 'hello', 'start': 0.1, ...}) or strings
            words = []
            for w in seg.words:
                if isinstance(w, dict):
                    w_str = w.get("word", "")
                elif hasattr(w, "word"):
                    w_str = getattr(w, "word", "")
                else:
                    w_str = str(w)
                clean = w_str.lower().strip(".,!?:;\"'()[]{}")
                if clean:
                    words.append(clean)

            text = (seg.text or "").lower()
            
            # Detect fillers
            for filler in self.filler_words:
                if " " in filler:
                    count = text.count(filler)
                    fillers_detected += count
                    if count > 0:
                        events.append("FILLER_DETECTED")
                else:
                    count = words.count(filler)
                    fillers_detected += count
                    if count > 0:
                        events.append("FILLER_DETECTED")
                        
            # Detect word repetitions
            for i in range(1, len(words)):
                if words[i] == words[i-1] and words[i] not in self.filler_words:
                    repetitions_detected += 1
                    events.append("HESITATION_DETECTED")
                    
            # Update recent words context for cross-segment repetition
            if self.recent_words and words:
                if words[0] == self.recent_words[-1] and words[0] not in self.filler_words:
                    repetitions_detected += 1
                    events.append("HESITATION_DETECTED")
                    
            # Detect false restarts
            if re.search(r'\b[a-z]+-[ \n]', seg.text or "") or "--" in (seg.text or ""):
                false_restarts += 1
                events.append("HESITATION_DETECTED")
                
            self.recent_words = words[-3:] if len(words) >= 3 else (self.recent_words + words)[-3:]
            
        stats = {
            "fillers_count": fillers_detected,
            "repetitions_count": repetitions_detected,
            "false_restarts_count": false_restarts
        }
        
        return stats, list(set(events))

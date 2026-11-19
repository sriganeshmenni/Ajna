import json
from typing import List, Any
from ..evidence.evidence_engine import EvidenceItem

class PromptBuilder:
    def __init__(self):
        self.system_prompt = (
            "You are MHEI (Multimodal Human Evaluation Intelligence), an objective assessment system.\n"
            "STRICT OBSERVABLE EVIDENCE PRINCIPLE:\n"
            "1. You are FORBIDDEN from inferring internal emotional states, thoughts, intentions, or deception.\n"
            "2. Every assertion MUST reference at least one valid, timestamped `evidence_id` from the provided evidence ledger.\n"
            "3. Ground all feedback purely in quantifiable audiovisual signals: gaze deviation angle, head pose velocity,\n"
            "   vocal jitter/shimmer, WPM cadence, phonetic disfluencies, and semantic technical coverage.\n"
            "4. Return strict JSON format with explicit evidence citations."
        )

    def build_evaluation_prompt(self, context: str, evidence: List[Any]) -> str:
        evidence_dicts = []
        for e in evidence:
            if hasattr(e, "dict"):
                evidence_dicts.append(e.dict())
            elif hasattr(e, "model_dump"):
                evidence_dicts.append(e.model_dump())
            elif isinstance(e, dict):
                evidence_dicts.append(e)

        payload = {
            "system_instruction": self.system_prompt,
            "session_context": context,
            "verified_evidence_ledger": evidence_dicts,
            "required_schema": {
                "executive_summary": "string",
                "trait_evaluations": {
                    "integrity": {"score": "float", "evidence_ids": ["string"], "justification": "string"},
                    "collegiality": {"score": "float", "evidence_ids": ["string"], "justification": "string"},
                    "social_versatility": {"score": "float", "evidence_ids": ["string"], "justification": "string"},
                    "development_orientation": {"score": "float", "evidence_ids": ["string"], "justification": "string"},
                    "overall_hireability": {"score": "float", "evidence_ids": ["string"], "justification": "string"}
                },
                "observable_strengths": [{"claim": "string", "evidence_id": "string"}],
                "quantified_improvement_areas": [{"claim": "string", "evidence_id": "string"}]
            }
        }
        return json.dumps(payload, indent=2)

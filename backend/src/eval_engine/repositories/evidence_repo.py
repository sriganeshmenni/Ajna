import logging
import time
from typing import List, Dict, Any, Optional
from ..database.collections import get_evidence_logs_collection

logger = logging.getLogger(__name__)

class EvidenceRepository:
    """MongoDB Repository for managing verified evidence logs."""

    @staticmethod
    async def log_evidence(session_id: str, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = get_evidence_logs_collection()
        doc = {
            "session_id": session_id,
            "evidence_id": evidence_data.get("id") or evidence_data.get("evidence_id") or f"ev_{int(time.time()*1000)}",
            "modality": evidence_data.get("modality", "VISION"),
            "indicator": evidence_data.get("indicator", "Observed Anomaly"),
            "severity": evidence_data.get("severity", "medium").upper(),
            "timestamp_start": float(evidence_data.get("timestamp_start", 0.0)),
            "timestamp_end": float(evidence_data.get("timestamp_end", 0.0)),
            "confidence": float(evidence_data.get("confidence", 0.5)),
            "supporting_signals": evidence_data.get("supporting_signals", []),
            "created_at": time.time()
        }
        res = await coll.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        return doc

    @staticmethod
    async def get_by_session(session_id: str) -> List[Dict[str, Any]]:
        coll = get_evidence_logs_collection()
        cursor = coll.find({"session_id": session_id}).sort("timestamp_start", 1)
        items = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            items.append(doc)
        return items

    @staticmethod
    async def count_by_severity(session_id: str) -> Dict[str, int]:
        coll = get_evidence_logs_collection()
        pipeline = [
            {"$match": {"session_id": session_id}},
            {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
        ]
        counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "INFORMATIONAL": 0}
        async for entry in coll.aggregate(pipeline):
            sev = entry["_id"]
            if sev in counts:
                counts[sev] = entry["count"]
        return counts

evidence_repo = EvidenceRepository()

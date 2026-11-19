import logging
import time
from typing import List, Dict, Any
from ..database.collections import get_audit_telemetry_collection

logger = logging.getLogger(__name__)

class TelemetryRepository:
    """MongoDB Repository for high-frequency audit telemetry logs."""

    @staticmethod
    async def record_snapshot(session_id: str, metrics: Dict[str, Any], epoch_ms: int | None = None) -> Dict[str, Any]:
        coll = get_audit_telemetry_collection()
        now_ms = epoch_ms if epoch_ms is not None else int(time.time() * 1000)
        doc = {
            "session_id": session_id,
            "epoch_ms": now_ms,
            "metrics": metrics
        }
        await coll.insert_one(doc)
        return doc

    @staticmethod
    async def record_batch(items: List[Dict[str, Any]]):
        if not items:
            return
        coll = get_audit_telemetry_collection()
        await coll.insert_many(items, ordered=False)

    @staticmethod
    async def get_session_telemetry(session_id: str, limit: int = 500) -> List[Dict[str, Any]]:
        coll = get_audit_telemetry_collection()
        cursor = coll.find({"session_id": session_id}).sort("epoch_ms", 1).limit(limit)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

telemetry_repo = TelemetryRepository()

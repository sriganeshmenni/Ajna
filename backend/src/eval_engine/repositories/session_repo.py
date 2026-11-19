import logging
import time
from typing import Optional, List, Dict, Any
from ..database.collections import get_sessions_collection
from ..models.session import Session, SessionConfig, SessionStatus

logger = logging.getLogger(__name__)

class SessionRepository:
    """MongoDB Repository for managing evaluation sessions."""

    @staticmethod
    async def create_session(config: SessionConfig, session_id: Optional[str] = None) -> Session:
        coll = get_sessions_collection()
        session = Session(id=session_id) if session_id else Session(config=config)
        session.config = config
        doc = session.model_dump()
        await coll.update_one({"id": session.id}, {"$set": doc}, upsert=True)
        return session

    @staticmethod
    async def get_session(session_id: str) -> Optional[Session]:
        coll = get_sessions_collection()
        doc = await coll.find_one({"id": session_id})
        if not doc:
            return None
        return Session(**doc)

    @staticmethod
    async def get_or_create_session(session_id: str, mode: str = "interview") -> Session:
        coll = get_sessions_collection()
        doc = await coll.find_one({"id": session_id})
        if doc:
            return Session(**doc)
        
        session = Session(id=session_id, status=SessionStatus.ACTIVE)
        session.config.mode = mode
        session.started_at = time.time()
        await coll.insert_one(session.model_dump())
        return session

    @staticmethod
    async def update_status(session_id: str, status: SessionStatus, timestamp: Optional[float] = None) -> Optional[Session]:
        coll = get_sessions_collection()
        now = timestamp or time.time()
        updates: Dict[str, Any] = {"status": status.value if hasattr(status, 'value') else status}
        if status == SessionStatus.ACTIVE:
            updates["started_at"] = now
        elif status == SessionStatus.COMPLETED:
            updates["ended_at"] = now

        result = await coll.find_one_and_update(
            {"id": session_id},
            {"$set": updates},
            return_document=True
        )
        if result:
            return Session(**result)
        return None

    @staticmethod
    async def append_evidence(session_id: str, evidence_data: dict):
        coll = get_sessions_collection()
        await coll.update_one(
            {"id": session_id},
            {"$push": {"evidence": evidence_data}}
        )

    @staticmethod
    async def list_sessions(limit: int = 50) -> List[Session]:
        coll = get_sessions_collection()
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        sessions = []
        async for doc in cursor:
            sessions.append(Session(**doc))
        return sessions

session_repo = SessionRepository()

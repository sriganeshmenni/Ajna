import logging
from pymongo import ASCENDING, DESCENDING, IndexModel
from .connection import get_database

logger = logging.getLogger(__name__)

# Collection Names
USERS_COLLECTION = "users"
SESSIONS_COLLECTION = "sessions"
EVIDENCE_LOGS_COLLECTION = "evidence_logs"
AUDIT_TELEMETRY_COLLECTION = "audit_telemetry"

def get_users_collection():
    return get_database()[USERS_COLLECTION]

def get_sessions_collection():
    return get_database()[SESSIONS_COLLECTION]

def get_evidence_logs_collection():
    return get_database()[EVIDENCE_LOGS_COLLECTION]

def get_audit_telemetry_collection():
    return get_database()[AUDIT_TELEMETRY_COLLECTION]

async def create_indexes():
    """Idempotently construct necessary MongoDB indexes for high-throughput queries."""
    db = get_database()
    logger.info("Initializing MongoDB indexes...")

    # Users Indexes
    await db[USERS_COLLECTION].create_indexes([
        IndexModel([("email", ASCENDING)], unique=True, name="idx_users_email_unique"),
        IndexModel([("id", ASCENDING)], unique=True, name="idx_users_id_unique"),
        IndexModel([("role", ASCENDING)], name="idx_users_role")
    ])

    # Sessions Indexes
    await db[SESSIONS_COLLECTION].create_indexes([
        IndexModel([("id", ASCENDING)], unique=True, name="idx_sessions_id_unique"),
        IndexModel([("session_id", ASCENDING)], sparse=True, name="idx_sessions_session_id"),
        IndexModel([("status", ASCENDING)], name="idx_sessions_status"),
        IndexModel([("created_at", DESCENDING)], name="idx_sessions_created_at")
    ])

    # Evidence Logs Indexes
    await db[EVIDENCE_LOGS_COLLECTION].create_indexes([
        IndexModel([("session_id", ASCENDING)], name="idx_evidence_session_id"),
        IndexModel([("evidence_id", ASCENDING)], name="idx_evidence_id"),
        IndexModel([("session_id", ASCENDING), ("timestamp_start", ASCENDING)], name="idx_evidence_session_time"),
        IndexModel([("severity", ASCENDING)], name="idx_evidence_severity")
    ])

    # Audit Telemetry Indexes
    await db[AUDIT_TELEMETRY_COLLECTION].create_indexes([
        IndexModel([("session_id", ASCENDING)], name="idx_telemetry_session_id"),
        IndexModel([("epoch_ms", ASCENDING)], name="idx_telemetry_epoch_ms"),
        IndexModel([("session_id", ASCENDING), ("epoch_ms", ASCENDING)], name="idx_telemetry_session_epoch")
    ])

    logger.info("MongoDB indexes verified successfully.")

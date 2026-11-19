import logging
import time
from .collections import get_users_collection
from ..core.auth.security import hash_password
from ..models.user import UserRole

logger = logging.getLogger(__name__)

DEFAULT_ACCOUNTS = [
    {
        "id": "usr_admin_01",
        "email": "admin@antigravity.ai",
        "password": "AdminPass2026!",
        "full_name": "Platform Administrator",
        "role": UserRole.ADMIN.value,
        "is_active": True,
    },
    {
        "id": "usr_evaluator_01",
        "email": "evaluator@antigravity.ai",
        "password": "EvalPass2026!",
        "full_name": "Dr. Sarah Vance (Lead Evaluator)",
        "role": UserRole.EVALUATOR.value,
        "is_active": True,
    },
    {
        "id": "usr_candidate_01",
        "email": "candidate@antigravity.ai",
        "password": "CandPass2026!",
        "full_name": "Alex Mercer (Candidate #01)",
        "role": UserRole.CANDIDATE.value,
        "is_active": True,
    }
]

async def seed_default_accounts():
    """Ensure default system accounts exist in MongoDB without overwriting existing custom data."""
    users_coll = get_users_collection()
    for acc in DEFAULT_ACCOUNTS:
        existing = await users_coll.find_one({"email": acc["email"].lower()})
        if not existing:
            doc = {
                "id": acc["id"],
                "email": acc["email"].lower(),
                "full_name": acc["full_name"],
                "role": acc["role"],
                "hashed_password": hash_password(acc["password"]),
                "is_active": acc["is_active"],
                "created_at": time.time()
            }
            await users_coll.insert_one(doc)
            logger.info(f"Seeded default account: {acc['email']} ({acc['role']})")
        else:
            logger.debug(f"Account already exists: {acc['email']}")

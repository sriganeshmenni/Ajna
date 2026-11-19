import logging
import secrets
import time
from typing import Optional, List
from ..database.collections import get_users_collection
from ..models.user import User, UserRole
from ..core.auth.security import hash_password

logger = logging.getLogger(__name__)

class UserRepository:
    """MongoDB Repository for managing User entities and credentials."""

    @staticmethod
    async def get_by_email(email: str) -> Optional[User]:
        clean_email = email.strip().lower()
        coll = get_users_collection()
        doc = await coll.find_one({"email": clean_email})
        if not doc:
            return None
        return User(**doc)

    @staticmethod
    async def get_by_id(user_id: str) -> Optional[User]:
        coll = get_users_collection()
        doc = await coll.find_one({"id": user_id})
        if not doc:
            return None
        return User(**doc)

    @staticmethod
    async def create_user(
        email: str,
        password: str,
        full_name: str,
        role: UserRole = UserRole.EVALUATOR,
        user_id: Optional[str] = None
    ) -> User:
        clean_email = email.strip().lower()
        coll = get_users_collection()
        existing = await coll.find_one({"email": clean_email})
        if existing:
            raise ValueError(f"User with email '{clean_email}' already exists.")

        uid = user_id or f"usr_{secrets.token_hex(6)}"
        user = User(
            id=uid,
            email=clean_email,
            full_name=full_name.strip(),
            role=role,
            hashed_password=hash_password(password),
            is_active=True,
            created_at=time.time()
        )
        await coll.insert_one(user.model_dump())
        return user

    @staticmethod
    async def list_users(limit: int = 100) -> List[User]:
        coll = get_users_collection()
        cursor = coll.find({}).limit(limit)
        users = []
        async for doc in cursor:
            users.append(User(**doc))
        return users

user_repo = UserRepository()

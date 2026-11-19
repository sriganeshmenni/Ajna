import time
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt
from ...config import settings
from ...models.user import User, UserRole

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with 12 salt rounds."""
    # Bcrypt maximum password length is 72 bytes
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    to_encode.update({"exp": int(expire.timestamp()), "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Creates a signed JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    to_encode.update({"exp": int(expire.timestamp()), "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

class EphemeralTicketStore:
    """
    In-memory store for single-use WebSocket authentication tickets.
    Prevents passing long-lived JWTs in URLs or query strings.
    """
    def __init__(self):
        self._tickets: Dict[str, Dict[str, Any]] = {}

    def create_ticket(self, user_id: str, session_id: str, role: str) -> str:
        ticket = f"wstk_{secrets.token_urlsafe(32)}"
        now = time.time()
        self._tickets[ticket] = {
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "created_at": now,
            "expires_at": now + settings.ws_ticket_expire_seconds
        }
        self._cleanup()
        return ticket

    def consume_ticket(self, ticket: str, session_id: str) -> Optional[Dict[str, Any]]:
        """Validates and consumes a single-use ticket."""
        self._cleanup()
        data = self._tickets.pop(ticket, None)
        if not data:
            return None
        if data["session_id"] != session_id:
            return None
        if time.time() > data["expires_at"]:
            return None
        return data

    def _cleanup(self):
        now = time.time()
        expired = [k for k, v in self._tickets.items() if now > v["expires_at"]]
        for k in expired:
            self._tickets.pop(k, None)

ticket_store = EphemeralTicketStore()

def create_ws_ticket(user_id: str, session_id: str, role: str) -> str:
    return ticket_store.create_ticket(user_id, session_id, role)

def consume_ws_ticket(ticket: str, session_id: str) -> Optional[Dict[str, Any]]:
    return ticket_store.consume_ticket(ticket, session_id)

class UserStore:
    """In-memory enterprise user storage pre-seeded with operational accounts."""
    def __init__(self):
        self._users: Dict[str, User] = {}
        self._seed_default_accounts()

    def _seed_default_accounts(self):
        # 1. Lead Evaluator
        self.create_user(
            email="evaluator@antigravity.ai",
            password="EvalPass2026!",
            full_name="Dr. Sarah Vance (Lead Evaluator)",
            role=UserRole.EVALUATOR,
            user_id="usr_evaluator_01"
        )
        # 2. Candidate
        self.create_user(
            email="candidate@antigravity.ai",
            password="CandPass2026!",
            full_name="Alex Mercer (Candidate #01)",
            role=UserRole.CANDIDATE,
            user_id="usr_candidate_01"
        )
        # 3. Administrator
        self.create_user(
            email="admin@antigravity.ai",
            password="AdminPass2026!",
            full_name="Platform Administrator",
            role=UserRole.ADMIN,
            user_id="usr_admin_01"
        )

    def create_user(
        self,
        email: str,
        password: str,
        full_name: str,
        role: UserRole = UserRole.EVALUATOR,
        user_id: Optional[str] = None
    ) -> User:
        clean_email = email.strip().lower()
        if clean_email in self._users:
            raise ValueError(f"User with email '{clean_email}' already exists.")
        
        user = User(
            id=user_id or f"usr_{secrets.token_hex(6)}",
            email=clean_email,
            full_name=full_name.strip(),
            role=role,
            hashed_password=hash_password(password),
            is_active=True,
            created_at=time.time()
        )
        self._users[clean_email] = user
        return user

    def get_by_email(self, email: str) -> Optional[User]:
        return self._users.get(email.strip().lower())

    def get_by_id(self, user_id: str) -> Optional[User]:
        for user in self._users.values():
            if user.id == user_id:
                return user
        return None

user_store = UserStore()

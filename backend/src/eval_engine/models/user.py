from enum import Enum
import time
from uuid import uuid4
from pydantic import BaseModel, Field, EmailStr

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    EVALUATOR = "evaluator"
    ADMIN = "admin"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    email: str
    full_name: str
    role: UserRole = UserRole.EVALUATOR
    hashed_password: str
    is_active: bool = True
    created_at: float = Field(default_factory=time.time)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: float

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.EVALUATOR

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class WSTicketRequest(BaseModel):
    session_id: str

class WSTicketResponse(BaseModel):
    ticket: str
    session_id: str
    expires_in: int

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import jwt
from ...models.user import (
    User, UserRole, UserResponse, LoginRequest, RegisterRequest,
    TokenResponse, RefreshTokenRequest, WSTicketRequest, WSTicketResponse
)
from ...core.auth.security import (
    user_store, verify_password, create_access_token,
    create_refresh_token, decode_token, create_ws_ticket
)
from ...repositories.user_repo import user_repo
from ...config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security_scheme = HTTPBearer(auto_error=False)

def to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type: access token expected"
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please refresh or log in again."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
        
    user = None
    try:
        user = await user_repo.get_by_id(user_id)
    except Exception as e:
        logger.warning(f"user_repo get_by_id failed, fallback to store: {e}")
    if not user:
        user = user_store.get_by_id(user_id)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found"
        )
    return user

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires role in {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user = None
    try:
        user = await user_repo.get_by_email(credentials.email)
    except Exception as e:
        logger.warning(f"user_repo login query failed, using in-memory store: {e}")
    if not user:
        user = user_store.get_by_email(credentials.email)

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated"
        )

    claims = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "name": user.full_name
    }
    access_token = create_access_token(claims)
    refresh_token = create_refresh_token(claims)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=to_user_response(user)
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    try:
        user = await user_repo.create_user(
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            role=payload.role
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        logger.warning(f"MongoDB create_user failed, falling back to in-memory store: {e}")
        try:
            user = user_store.create_user(
                email=payload.email,
                password=payload.password,
                full_name=payload.full_name,
                role=payload.role
            )
        except ValueError as err:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(err)
            )

    claims = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "name": user.full_name
    }
    access_token = create_access_token(claims)
    refresh_token = create_refresh_token(claims)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=to_user_response(user)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(payload: RefreshTokenRequest):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type: refresh token expected"
            )
        user_id = decoded.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please log in again."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = None
    try:
        user = await user_repo.get_by_id(user_id)
    except Exception as e:
        logger.warning(f"user_repo refresh lookup failed: {e}")
    if not user:
        user = user_store.get_by_id(user_id)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    claims = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "name": user.full_name
    }
    new_access = create_access_token(claims)
    new_refresh = create_refresh_token(claims)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=to_user_response(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return to_user_response(current_user)

@router.post("/ws-ticket", response_model=WSTicketResponse)
async def get_websocket_ticket(
    payload: WSTicketRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates a cryptographically secure, single-use ticket for establishing
    a WebSocket connection without passing long-lived credentials in URLs.
    """
    ticket = create_ws_ticket(
        user_id=current_user.id,
        session_id=payload.session_id,
        role=current_user.role.value
    )
    return WSTicketResponse(
        ticket=ticket,
        session_id=payload.session_id,
        expires_in=settings.ws_ticket_expire_seconds
    )

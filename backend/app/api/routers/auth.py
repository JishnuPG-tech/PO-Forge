from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import jwt

from backend.app.core.config import settings
from backend.app.api.deps import get_current_user, UserTokenPayload

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    is_admin: bool

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    target_exam: str = "IBPS_RRB_PO"

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    google_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

@router.post("/login", response_model=LoginResponse)
def login_for_access_token(req: LoginRequest):
    is_admin = (req.email == "admin@poforge.ai" or "admin" in req.email)
    user_id = "ADMIN_DEV_999" if is_admin else f"USR_{hash(req.email) % 1000000:06d}"

    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user_id,
        "email": req.email,
        "is_admin": is_admin,
        "exp": exp
    }
    
    token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm="HS256")
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        email=req.email,
        is_admin=is_admin
    )

@router.post("/google", response_model=LoginResponse)
def login_with_google(req: GoogleAuthRequest):
    email = req.email or "jishnu.pg@gmail.com"
    name = req.name or "Jishnu PG"
    user_id = f"GOOGLE_{abs(hash(email)) % 1000000:06d}"

    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "picture": req.picture,
        "is_admin": False,
        "exp": exp
    }
    
    token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm="HS256")
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        email=email,
        is_admin=False
    )

@router.get("/me")
def read_current_user_profile(current_user: UserTokenPayload = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": getattr(current_user, "name", "Jishnu PG"),
        "is_admin": current_user.is_admin,
        "target_exam": "IBPS RRB PO",
        "target_exam_days_left": 43,
        "streak_days": 12,
        "enabled_subjects": ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"]
    }

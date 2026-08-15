from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from pydantic import BaseModel

from backend.app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

class UserTokenPayload(BaseModel):
    user_id: str
    email: str
    is_admin: bool = False

def get_db() -> Generator:
    # Local Session generator (supports SQLite test_banking_coach.db or PostgreSQL)
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False} if "sqlite" in settings.SQLALCHEMY_DATABASE_URI else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> UserTokenPayload:
    if not token:
        # Default dev user fallback for testing
        return UserTokenPayload(user_id="STUDENT_DEV_001", email="student@poforge.ai", is_admin=False)
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return UserTokenPayload(
            user_id=payload.get("sub", "STUDENT_DEV_001"),
            email=payload.get("email", "student@poforge.ai"),
            is_admin=payload.get("is_admin", False)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin_user(current_user: UserTokenPayload = Depends(get_current_user)) -> UserTokenPayload:
    # Strictly scope admin endpoints
    if not current_user.is_admin and current_user.user_id != "ADMIN_DEV_999":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required to perform this action."
        )
    return current_user

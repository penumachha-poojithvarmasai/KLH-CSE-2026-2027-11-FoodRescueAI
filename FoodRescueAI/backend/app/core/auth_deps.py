from typing import List, Optional, Callable
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_jwt_token
from app.models.user import UserModel

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Extracts JWT token from Authorization header (Bearer <token>),
    validates the signature & expiration, and loads the user from database.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Authorization header."
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'."
        )
    
    token = parts[1]
    try:
        payload = decode_jwt_token(token)
    except RuntimeError as config_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(config_err)
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(val_err)}"
        )
    
    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier."
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists."
        )
    
    return user

def require_roles(*allowed_roles: str) -> Callable:
    """
    Returns a dependency enforcing role-based access authorization.
    For example: require_roles("ADMIN") or require_roles("ADMIN", "FOOD_PROVIDER").
    Enforces HTTP 403 Forbidden when user's role is unauthorized.
    """
    def dependency(user: UserModel = Depends(get_current_user)) -> UserModel:
        if allowed_roles and user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires role in [{', '.join(allowed_roles)}]. Your role is '{user.role}'."
            )
        return user
    
    return dependency

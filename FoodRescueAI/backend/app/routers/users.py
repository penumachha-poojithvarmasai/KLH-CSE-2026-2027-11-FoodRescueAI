from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.core.auth_deps import require_roles
from app.models.user import UserModel
from app.schemas.domain import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["Users & Auth Service (Port 8081 SOA)"])

@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_roles("ADMIN"))
):
    """Enforced by backend: Only users authenticated with the ADMIN role can query all users."""
    return db.query(UserModel).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(require_roles("ADMIN"))
):
    """Enforced by backend: Only users authenticated with the ADMIN role can create users via administrative user management."""
    existing = db.query(UserModel).filter(UserModel.email == user_in.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    data = user_in.model_dump() if hasattr(user_in, 'model_dump') else user_in.dict()
    data["email"] = data["email"].strip().lower()
    password = data.pop("password", None)
    if password:
        data["password_hash"] = hash_password(password)
    db_user = UserModel(**data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user




from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_jwt_token
from app.core.auth_deps import get_current_user
from app.models.user import UserModel
from app.schemas.domain import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth & JWT Service"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email_clean = request.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == email_clean).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user account found with that email address."
        )
    
    if user.password_hash:
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. Incorrect password."
            )
    
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    }
    
    try:
        token = create_jwt_token(payload)
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(err)
        )
    
    return {
        "token": token,
        "token_type": "bearer",
        "user": user
    }

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    organization: str

class RegisterResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse

ALLOWED_PUBLIC_ROLES = {"FOOD_PROVIDER", "RECIPIENT", "LOGISTICS_COORDINATOR"}

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_public_user(request: RegisterRequest, db: Session = Depends(get_db)):
    role_clean = request.role.strip().upper()
    
    if role_clean == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration with ADMIN role is not permitted."
        )
    
    if role_clean not in ALLOWED_PUBLIC_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid registration role '{role_clean}'. Allowed roles: {', '.join(sorted(ALLOWED_PUBLIC_ROLES))}"
        )
    
    email_clean = request.email.strip().lower()
    existing = db.query(UserModel).filter(UserModel.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    db_user = UserModel(
        name=request.name.strip(),
        email=email_clean,
        password_hash=hash_password(request.password),
        role=role_clean,
        organization=request.organization.strip(),
        source_name="Public Self-Registration",
        source_url="https://foodrescue.ai/register"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    payload = {
        "sub": db_user.id,
        "email": db_user.email,
        "role": db_user.role,
        "name": db_user.name
    }
    
    try:
        token = create_jwt_token(payload)
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(err)
        )
    
    return {
        "token": token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/logout")
def logout():
    return {"message": "Session logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


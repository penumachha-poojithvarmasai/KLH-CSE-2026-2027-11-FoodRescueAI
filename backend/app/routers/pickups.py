from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_jwt_token
from app.models.user import UserModel
from app.models.pickup import PickupTaskModel
from app.models.redistribution import RedistributionItemModel
from app.models.food import FoodSubmissionModel
from app.schemas.domain import PickupTaskCreate, PickupTaskResponse
from app.routers.redistributions import VALID_REDISTRIBUTION_STATUSES, ALLOWED_STATUS_TRANSITIONS

router = APIRouter(prefix="/pickups", tags=["Logistics & Pickup Service"])

@router.get("", response_model=List[PickupTaskResponse])
def get_pickups(db: Session = Depends(get_db)):
    return db.query(PickupTaskModel).all()

@router.get("/{pickup_id}", response_model=PickupTaskResponse)
def get_pickup(pickup_id: str, db: Session = Depends(get_db)):
    pickup = db.query(PickupTaskModel).filter(PickupTaskModel.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup task not found")
    return pickup

@router.post("", response_model=PickupTaskResponse, status_code=status.HTTP_201_CREATED)
def create_pickup_task(pickup_in: PickupTaskCreate, db: Session = Depends(get_db)):
    data = pickup_in.model_dump() if hasattr(pickup_in, "model_dump") else pickup_in.dict()

    # Check if a pickup task already exists for this redistribution_id to prevent duplicates
    existing_pickup = db.query(PickupTaskModel).filter(
        PickupTaskModel.redistribution_id == pickup_in.redistribution_id
    ).first()
    if existing_pickup:
        for key, value in data.items():
            if value is not None and key != "id":
                setattr(existing_pickup, key, value)
        db.commit()
        db.refresh(existing_pickup)
        return existing_pickup

    db_pickup = PickupTaskModel(**data)
    db.add(db_pickup)
    db.commit()
    db.refresh(db_pickup)
    return db_pickup


@router.patch("/{pickup_id}/status", response_model=PickupTaskResponse)
def update_pickup_status(
    pickup_id: str,
    status_val: str,
    note: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Mandatory JWT Bearer token RBAC check
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide 'Authorization: Bearer <token>' header."
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    user_id = payload.get("sub") or payload.get("user_id")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists."
        )
    allowed_roles = ["LOGISTICS_COORDINATOR", "ADMIN", "RECIPIENT"]
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Action requires role in [{', '.join(allowed_roles)}]. Your role is '{user.role}'."
        )

    pickup = db.query(PickupTaskModel).filter(PickupTaskModel.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup task not found")

    status_clean = status_val.strip().upper()
    if status_clean not in VALID_REDISTRIBUTION_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_clean}'. Allowed statuses: {sorted(list(VALID_REDISTRIBUTION_STATUSES))}"
        )

    if pickup.current_status and status_clean != pickup.current_status:
        allowed = ALLOWED_STATUS_TRANSITIONS.get(pickup.current_status, set())
        if status_clean not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition: cannot transition from '{pickup.current_status}' to '{status_clean}'."
            )

    pickup.current_status = status_clean

    # Synchronize linked RedistributionItemModel and FoodSubmissionModel
    if pickup.redistribution_id:
        redist = db.query(RedistributionItemModel).filter(RedistributionItemModel.id == pickup.redistribution_id).first()
        if redist:
            redist.status = status_clean
            existing_timeline = list(redist.timeline or [])
            existing_timeline.append({
                "status": status_clean,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "note": note or f"Pickup task updated to {status_clean}"
            })
            redist.timeline = existing_timeline

            if redist.submission_id:
                sub = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == redist.submission_id).first()
                if sub:
                    sub.status = status_clean

    db.commit()
    db.refresh(pickup)

    # Trigger status update email for delivery progress
    if status_clean in ["IN_TRANSIT", "DELIVERED", "COMPLETED", "PICKED_UP", "REDISTRIBUTED"]:
        from app.services.email_service import EmailService

        provider_user = db.query(UserModel).filter(
            (UserModel.organization == pickup.provider_name) | (UserModel.role == "FOOD_PROVIDER")
        ).first()
        recipient_user = db.query(UserModel).filter(
            (UserModel.organization == pickup.recipient_name) | (UserModel.role == "RECIPIENT")
        ).first()

        EmailService.send_status_update_email(
            recipient_email=recipient_user.email if recipient_user else None,
            provider_email=provider_user.email if provider_user else None,
            food_name=f"Donation for {pickup.recipient_name}",
            new_status=status_clean,
            reference_id=pickup.id,
            note=note or f"Pickup transport route from '{pickup.pickup_address}' to '{pickup.destination_address}' is currently {status_clean.replace('_', ' ').title()}."
        )

    return pickup


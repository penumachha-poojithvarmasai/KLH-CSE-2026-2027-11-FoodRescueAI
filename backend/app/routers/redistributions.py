from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_jwt_token
from app.models.user import UserModel
from app.models.redistribution import RedistributionItemModel
from app.models.pickup import PickupTaskModel
from app.models.food import FoodSubmissionModel
from app.models.recipient import RecipientModel
from app.models.notification import NotificationItemModel
from app.schemas.domain import RedistributionItemCreate, RedistributionItemResponse

router = APIRouter(prefix="/redistributions", tags=["Redistribution Service (Port 8085 SOA)"])

def hydrate_redistribution(item: RedistributionItemModel, db: Session) -> RedistributionItemModel:
    if item:
        if not getattr(item, "submission", None) and item.submission_id:
            item.submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == item.submission_id).first()
        if not getattr(item, "recipient", None) and item.matched_recipient_id:
            item.recipient = db.query(RecipientModel).filter(RecipientModel.id == item.matched_recipient_id).first()
    return item

@router.get("", response_model=List[RedistributionItemResponse])
def get_redistributions(status_filter: Optional[str] = Query(None, alias="status"), db: Session = Depends(get_db)):
    query = db.query(RedistributionItemModel)
    if status_filter and isinstance(status_filter, str):
        query = query.filter(RedistributionItemModel.status == status_filter)
    items = query.order_by(RedistributionItemModel.created_at.desc()).all()
    
    subs = {s.id: s for s in db.query(FoodSubmissionModel).all()}
    recs = {r.id: r for r in db.query(RecipientModel).all()}
    for it in items:
        it.submission = subs.get(it.submission_id)
        it.recipient = recs.get(it.matched_recipient_id)
    return items

@router.get("/{redistribution_id}", response_model=RedistributionItemResponse)
def get_redistribution(redistribution_id: str, db: Session = Depends(get_db)):
    item = db.query(RedistributionItemModel).filter(RedistributionItemModel.id == redistribution_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Redistribution item not found")
    return hydrate_redistribution(item, db)

@router.post("", response_model=RedistributionItemResponse, status_code=status.HTTP_201_CREATED)
def create_redistribution(item_in: RedistributionItemCreate, db: Session = Depends(get_db)):
    data = item_in.model_dump() if hasattr(item_in, "model_dump") else item_in.dict()

    # Check if a redistribution already exists for this submission_id to prevent duplicates
    existing_item = db.query(RedistributionItemModel).filter(
        RedistributionItemModel.submission_id == item_in.submission_id
    ).first()

    status_target = data.get("status")
    if not status_target or status_target == "AVAILABLE":
        status_target = "MATCHED"

    if existing_item:
        if data.get("matched_recipient_id"):
            existing_item.matched_recipient_id = data["matched_recipient_id"]
        if data.get("match_score") is not None:
            existing_item.match_score = data["match_score"]
        existing_item.status = status_target
        if data.get("timeline"):
            existing_item.timeline = data["timeline"]
        elif not existing_item.timeline:
            existing_item.timeline = [
                {"status": "AVAILABLE", "timestamp": datetime.utcnow().isoformat() + "Z", "note": "Food intake logged by provider."},
                {"status": status_target, "timestamp": datetime.utcnow().isoformat() + "Z", "note": f"Dispatched to recipient {data.get('matched_recipient_id')}."}
            ]
        db_item = existing_item
    else:
        data["status"] = status_target
        db_item = RedistributionItemModel(**data)
        db.add(db_item)

    # Persist approval status on linked FoodSubmissionModel in SQLite
    from app.models.food import FoodSubmissionModel
    submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == db_item.submission_id).first()
    if submission:
        submission.status = db_item.status

    # Synchronize linked PickupTaskModel if one exists
    pickup = db.query(PickupTaskModel).filter(PickupTaskModel.redistribution_id == db_item.id).first()
    if pickup and db_item.status:
        pickup.current_status = db_item.status

    db.commit()
    db.refresh(db_item)
    if submission:
        db.refresh(submission)

    # 1. Look up recipient and submission details for notification and SMS dispatch
    recipient = None
    if db_item.matched_recipient_id:
        from app.models.recipient import RecipientModel
        recipient = db.query(RecipientModel).filter(RecipientModel.id == db_item.matched_recipient_id).first()

    recipient_name = recipient.name if recipient else "Designated NGO Recipient"
    food_name = submission.food_name if submission else "Surplus Food Donation"
    quantity_str = f"{submission.quantity:g} {submission.unit}" if submission else "batch"
    provider_name = submission.provider_name if submission else "Food Provider"
    pickup_addr = (
        submission.location.get("address") 
        if (submission and isinstance(submission.location, dict)) 
        else "Intake Location"
    )

    # 2. Trigger Twilio SMS to recipient phone (if configured / fallback to skipped)
    if recipient and recipient.phone:
        from app.services.sms_service import TwilioSMSService
        TwilioSMSService.send_redistribution_dispatch_sms(
            redistribution_id=db_item.id,
            recipient_name=recipient.name,
            recipient_phone=recipient.phone,
            food_name=food_name,
            quantity_str=quantity_str,
            provider_name=provider_name,
            pickup_address=pickup_addr,
            match_score=db_item.match_score
        )

    # 3. Trigger Email confirmation to recipient & provider (if configured / fallback to skipped)
    from app.models.user import UserModel
    provider_user = None
    if submission and submission.provider_id:
        provider_user = db.query(UserModel).filter(UserModel.id == submission.provider_id).first()
    if not provider_user and submission:
        provider_user = db.query(UserModel).filter(UserModel.organization == submission.provider_name).first()
    provider_email = provider_user.email if provider_user else None

    rec_user = None
    if recipient:
        rec_user = db.query(UserModel).filter(
            (UserModel.organization == recipient.name) | (UserModel.name == recipient.name)
        ).first()
    if not rec_user:
        rec_user = db.query(UserModel).filter(UserModel.role == "RECIPIENT").first()
    recipient_email = rec_user.email if rec_user else None

    dest_addr = (
        recipient.location.get("address") 
        if (recipient and isinstance(recipient.location, dict)) 
        else "Designated Community Distribution Center"
    )

    from app.services.email_service import EmailService
    EmailService.send_redistribution_confirmation_email(
        recipient_email=recipient_email,
        provider_email=provider_email,
        recipient_name=recipient_name,
        provider_name=provider_name,
        food_name=food_name,
        quantity_str=quantity_str,
        pickup_address=pickup_addr,
        destination_address=dest_addr,
        match_score=db_item.match_score or 90.0,
        redistribution_id=db_item.id
    )

    # 4. Always persist in-app notification in database
    from app.models.notification import NotificationItemModel
    in_app_notif = NotificationItemModel(
        title="Redistribution Request Dispatched",
        message=f"Matched '{food_name}' with {recipient_name} ({db_item.match_score or 90:.0f}% match). Pickup dispatch queued.",
        type="success",
        read=False,
        target_section="redistribution",
        source_name="FoodRescue Redistribution Orchestrator"
    )
    db.add(in_app_notif)
    db.commit()

    db_item.submission = submission
    db_item.recipient = recipient
    return db_item


VALID_REDISTRIBUTION_STATUSES = {
    "AVAILABLE", "ANALYZING", "MATCHED", "REQUESTED", "ACCEPTED",
    "PICKUP_REQUESTED", "PICKUP_CONFIRMED", "IN_TRANSIT",
    "REDISTRIBUTED", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"
}

ALLOWED_STATUS_TRANSITIONS = {
    "AVAILABLE": {"ANALYZING", "MATCHED", "CANCELLED", "EXPIRED"},
    "ANALYZING": {"AVAILABLE", "MATCHED", "CANCELLED", "EXPIRED"},
    "MATCHED": {"REQUESTED", "ACCEPTED", "PICKUP_REQUESTED", "PICKUP_CONFIRMED", "IN_TRANSIT", "CANCELLED", "REJECTED"},
    "REQUESTED": {"ACCEPTED", "MATCHED", "REJECTED", "CANCELLED"},
    "ACCEPTED": {"PICKUP_REQUESTED", "PICKUP_CONFIRMED", "IN_TRANSIT", "CANCELLED"},
    "PICKUP_REQUESTED": {"PICKUP_CONFIRMED", "IN_TRANSIT", "CANCELLED"},
    "PICKUP_CONFIRMED": {"IN_TRANSIT", "REDISTRIBUTED", "COMPLETED", "CANCELLED"},
    "IN_TRANSIT": {"REDISTRIBUTED", "COMPLETED", "CANCELLED"},
    "REDISTRIBUTED": {"COMPLETED"},
    "COMPLETED": set(),
    "REJECTED": {"MATCHED"},
    "CANCELLED": set(),
    "EXPIRED": set(),
}

@router.patch("/{redistribution_id}/status", response_model=RedistributionItemResponse)
def update_redistribution_status(
    redistribution_id: str,
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

    item = db.query(RedistributionItemModel).filter(RedistributionItemModel.id == redistribution_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Redistribution item not found")

    status_clean = status_val.strip().upper()
    if status_clean not in VALID_REDISTRIBUTION_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_clean}'. Allowed statuses: {sorted(list(VALID_REDISTRIBUTION_STATUSES))}"
        )

    if item.status and status_clean != item.status:
        allowed = ALLOWED_STATUS_TRANSITIONS.get(item.status, set())
        if status_clean not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition: cannot transition from '{item.status}' to '{status_clean}'."
            )

    item.status = status_clean
    new_timeline_entry = {
        "status": status_clean,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "note": note or f"Status updated to {status_clean}"
    }
    existing_timeline = list(item.timeline or [])
    existing_timeline.append(new_timeline_entry)
    item.timeline = existing_timeline

    # Synchronize linked PickupTaskModel and FoodSubmissionModel
    pickup = db.query(PickupTaskModel).filter(PickupTaskModel.redistribution_id == redistribution_id).first()
    if pickup:
        pickup.current_status = status_clean

    if item.submission_id:
        sub = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == item.submission_id).first()
        if sub:
            sub.status = status_clean

    db.commit()
    db.refresh(item)

    # In-App notification creation in SQLite for status transition audit
    submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == item.submission_id).first() if item.submission_id else None
    food_name = submission.food_name if submission else "Food Donation"
    in_app_notif = NotificationItemModel(
        title=f"Logistics Status: {status_clean.replace('_', ' ').title()}",
        message=f"Redistribution for '{food_name}' transitioned to {status_clean}. {note or ''}".strip(),
        type="info" if status_clean != "COMPLETED" else "success",
        read=False,
        target_section="logistics",
        source_name="FoodRescue Logistics Engine"
    )
    db.add(in_app_notif)
    db.commit()

    # Send status update email for key milestones (IN_TRANSIT, DELIVERED, COMPLETED)
    if status_clean in ["IN_TRANSIT", "DELIVERED", "COMPLETED", "REDISTRIBUTED"]:
        from app.services.email_service import EmailService

        provider_user = db.query(UserModel).filter(UserModel.role == "FOOD_PROVIDER").first()
        recipient_user = db.query(UserModel).filter(UserModel.role == "RECIPIENT").first()

        EmailService.send_status_update_email(
            recipient_email=recipient_user.email if recipient_user else None,
            provider_email=provider_user.email if provider_user else None,
            food_name=food_name,
            new_status=status_clean,
            reference_id=item.id,
            note=note
        )

    return hydrate_redistribution(item, db)


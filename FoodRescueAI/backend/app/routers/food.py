from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.food import FoodSubmissionModel
from app.schemas.domain import FoodSubmissionCreate, FoodSubmissionResponse

router = APIRouter(prefix="/food", tags=["Food Service (Port 8082 SOA)"])

@router.get("/submissions", response_model=List[FoodSubmissionResponse])
def get_food_submissions(
    provider_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(FoodSubmissionModel)
    if provider_id:
        query = query.filter(FoodSubmissionModel.provider_id == provider_id)
    if status_filter:
        query = query.filter(FoodSubmissionModel.status == status_filter)
    return query.order_by(FoodSubmissionModel.created_at.desc()).all()

@router.get("/submissions/{submission_id}", response_model=FoodSubmissionResponse)
def get_food_submission(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Food submission not found")
    return submission

@router.post("/submissions", response_model=FoodSubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_food_submission(submission_in: FoodSubmissionCreate, db: Session = Depends(get_db)):
    data = submission_in.model_dump() if hasattr(submission_in, "model_dump") else submission_in.dict()
    
    if not data.get("ai_analysis"):
        from app.services.ai_service import analyze_food_submission
        analysis = analyze_food_submission(data)
        data["ai_analysis"] = analysis
        if data.get("urgency") in [None, "MEDIUM"] and analysis.get("urgency"):
            data["urgency"] = analysis["urgency"]
        if data.get("perishability") in [None, "MEDIUM"] and analysis.get("perishability"):
            data["perishability"] = analysis["perishability"]
        if (data.get("remaining_hours") in [None, 12.0]) and analysis.get("remainingUsableHours"):
            data["remaining_hours"] = analysis["remainingUsableHours"]

    db_submission = FoodSubmissionModel(**data)
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    # Trigger urgent SMS and Email if food is CRITICAL or HIGH urgency and recipient contact is accessible
    is_urgent = db_submission.urgency in ["CRITICAL", "HIGH"]
    if is_urgent:
        from app.models.recipient import RecipientModel
        from app.models.user import UserModel
        from app.services.sms_service import TwilioSMSService
        from app.services.email_service import EmailService

        # Find highest need compatible recipient in DB
        top_rec = db.query(RecipientModel).filter(
            RecipientModel.current_need_level.in_(["CRITICAL", "HIGH"])
        ).first()

        recipient_email = None
        if top_rec:
            rec_user = db.query(UserModel).filter(
                (UserModel.organization == top_rec.name) | (UserModel.name == top_rec.name)
            ).first()
            if not rec_user:
                rec_user = db.query(UserModel).filter(UserModel.role == "RECIPIENT").first()
            recipient_email = rec_user.email if rec_user else None

        if top_rec and top_rec.phone:
            TwilioSMSService.send_urgent_surplus_sms(
                food_name=db_submission.food_name,
                quantity_str=f"{db_submission.quantity:g} {db_submission.unit}",
                remaining_hours=float(db_submission.remaining_hours or 3.0),
                provider_name=db_submission.provider_name,
                recipient_phone=top_rec.phone,
                recipient_name=top_rec.name
            )

        if top_rec:
            EmailService.send_urgent_surplus_alert_email(
                recipient_email=recipient_email,
                recipient_name=top_rec.name,
                food_name=db_submission.food_name,
                quantity_str=f"{db_submission.quantity:g} {db_submission.unit}",
                remaining_hours=float(db_submission.remaining_hours or 3.0),
                provider_name=db_submission.provider_name,
                urgency=db_submission.urgency
            )

    # Persist in-app notification in database
    from app.models.notification import NotificationItemModel
    notif_title = "Urgent Food Intake Logged" if is_urgent else "Surplus Food Submitted"
    notif_type = "warning" if is_urgent else "info"
    in_app_notif = NotificationItemModel(
        title=notif_title,
        message=f"'{db_submission.food_name}' ({db_submission.quantity:g} {db_submission.unit}) registered into FoodRescue workflow.",
        type=notif_type,
        read=False,
        target_section="submissions",
        source_name="FoodRescue Intake Agent"
    )
    db.add(in_app_notif)
    db.commit()

    return db_submission


@router.patch("/submissions/{submission_id}/status", response_model=FoodSubmissionResponse)
def update_food_submission_status(
    submission_id: str,
    status_val: str,
    db: Session = Depends(get_db)
):
    submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Food submission not found")
    submission.status = status_val
    db.commit()
    db.refresh(submission)
    return submission

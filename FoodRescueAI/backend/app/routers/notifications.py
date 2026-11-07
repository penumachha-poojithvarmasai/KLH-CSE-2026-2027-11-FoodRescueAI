from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notification import NotificationItemModel
from app.schemas.domain import NotificationItemCreate, NotificationItemResponse

router = APIRouter(prefix="/notifications", tags=["Notification Service"])

@router.get("/sms/status")
def check_sms_gateway_status():
    """
    Returns the real-time operational status of the Twilio SMS Gateway and fallback state.
    Never exposes API secrets or auth tokens.
    """
    from app.services.sms_service import TwilioSMSService
    return TwilioSMSService.get_gateway_status()

@router.get("/email/status")
def check_email_service_status():
    """
    Returns the real-time diagnostic status of the SMTP Email Service and fallback state.
    Never exposes SMTP passwords or auth secrets.
    """
    from app.services.email_service import EmailService
    return EmailService.get_service_status()

@router.get("", response_model=List[NotificationItemResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(NotificationItemModel).order_by(NotificationItemModel.created_at.desc()).all()

@router.post("", response_model=NotificationItemResponse, status_code=status.HTTP_201_CREATED)
def create_notification(notif_in: NotificationItemCreate, db: Session = Depends(get_db)):
    data = notif_in.model_dump() if hasattr(notif_in, "model_dump") else notif_in.dict()
    db_notif = NotificationItemModel(**data)
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


@router.put("/{notification_id}/read", response_model=NotificationItemResponse)
def mark_read(notification_id: str, db: Session = Depends(get_db)):
    notif = db.query(NotificationItemModel).filter(NotificationItemModel.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif

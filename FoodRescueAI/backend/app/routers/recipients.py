from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.recipient import RecipientModel
from app.schemas.domain import RecipientCreate, RecipientResponse

router = APIRouter(prefix="/recipients", tags=["Recipient Service"])

@router.get("", response_model=List[RecipientResponse])
def get_recipients(db: Session = Depends(get_db)):
    return db.query(RecipientModel).all()

@router.get("/{recipient_id}", response_model=RecipientResponse)
def get_recipient(recipient_id: str, db: Session = Depends(get_db)):
    recipient = db.query(RecipientModel).filter(RecipientModel.id == recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient organization not found")
    return recipient

@router.post("", response_model=RecipientResponse, status_code=status.HTTP_201_CREATED)
def create_recipient(recipient_in: RecipientCreate, db: Session = Depends(get_db)):
    data = recipient_in.model_dump() if hasattr(recipient_in, "model_dump") else recipient_in.dict()
    db_recipient = RecipientModel(**data)
    db.add(db_recipient)
    db.commit()
    db.refresh(db_recipient)
    return db_recipient


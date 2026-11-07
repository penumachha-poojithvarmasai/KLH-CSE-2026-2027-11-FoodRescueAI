from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.match import RecipientMatchModel
from app.models.food import FoodSubmissionModel
from app.schemas.domain import RecipientMatchCreate, RecipientMatchResponse

router = APIRouter(prefix="/matches", tags=["Matching Service (Port 8084 SOA)"])

@router.get("", response_model=List[RecipientMatchResponse])
def get_matches(submission_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(RecipientMatchModel)
    if submission_id:
        query = query.filter(RecipientMatchModel.submission_id == submission_id)
    return query.order_by(RecipientMatchModel.overall_score.desc()).all()

@router.post("/match-logs", response_model=RecipientMatchResponse, status_code=status.HTTP_201_CREATED)
def record_match_log(match_in: RecipientMatchCreate, db: Session = Depends(get_db)):
    # Validate that the referenced food submission exists before inserting
    submission = db.query(FoodSubmissionModel).filter(FoodSubmissionModel.id == match_in.submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid submission ID: Food submission '{match_in.submission_id}' does not exist."
        )

    data = match_in.model_dump() if hasattr(match_in, "model_dump") else match_in.dict()
    db_match = RecipientMatchModel(**data)
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

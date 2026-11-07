from sqlalchemy import Column, String, Float, JSON, ForeignKey
from app.core.database import Base
from app.models.base import BaseModelMixin

class RedistributionItemModel(Base, BaseModelMixin):
    __tablename__ = "redistributions"

    submission_id = Column(String(36), ForeignKey("food_submissions.id"), nullable=False, index=True)
    matched_recipient_id = Column(String(36), ForeignKey("recipients.id"), nullable=True, index=True)
    match_score = Column(Float, nullable=True)
    status = Column(String(32), nullable=False, default="AVAILABLE")
    
    # Timeline event history list of JSON objects: [{"status": "...", "timestamp": "...", "note": "..."}]
    timeline = Column(JSON, nullable=False, default=list)

from sqlalchemy import Column, String, Float, JSON, ForeignKey
from app.core.database import Base
from app.models.base import BaseModelMixin

class RecipientMatchModel(Base, BaseModelMixin):
    __tablename__ = "recipient_matches"

    submission_id = Column(String(36), ForeignKey("food_submissions.id"), nullable=False, index=True)
    recipient_id = Column(String(36), ForeignKey("recipients.id"), nullable=False, index=True)
    overall_score = Column(Float, nullable=False) # 0 - 100
    
    # 5-factor breakdown JSON: {categoryCompatibilityScore, needLevelScore, capacityMatchScore, distanceScore, availabilityScore}
    breakdown = Column(JSON, nullable=False)
    
    suitability_status = Column(String(32), nullable=False) # OPTIMAL, GOOD, MODERATE, POOR

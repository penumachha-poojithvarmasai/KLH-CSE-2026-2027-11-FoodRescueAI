from sqlalchemy import Column, String, Float, Integer, Text, JSON
from app.core.database import Base
from app.models.base import BaseModelMixin

class FoodSubmissionModel(Base, BaseModelMixin):
    __tablename__ = "food_submissions"

    provider_id = Column(String(36), nullable=False, index=True)
    provider_name = Column(String(128), nullable=False)
    food_name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    estimated_servings = Column(Integer, nullable=False)
    preparation_time = Column(String(64), nullable=False)
    expiry_time = Column(String(64), nullable=False)
    storage_condition = Column(String(64), nullable=False)  # Ambient, Refrigerated, Frozen, Hot Held
    
    # Embedded location JSON {"address": "...", "lat": ..., "lng": ...}
    location = Column(JSON, nullable=False)
    
    urgency = Column(String(32), nullable=False, default="MEDIUM")       # LOW, MEDIUM, HIGH, CRITICAL
    perishability = Column(String(32), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    remaining_hours = Column(Float, nullable=False, default=12.0)
    notes = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="AVAILABLE")    # RedistributionStatus
    
    # Optional AI analysis payload JSON
    ai_analysis = Column(JSON, nullable=True)

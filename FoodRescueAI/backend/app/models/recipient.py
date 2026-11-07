from sqlalchemy import Column, String, Float, Integer, JSON
from app.core.database import Base
from app.models.base import BaseModelMixin

class RecipientModel(Base, BaseModelMixin):
    __tablename__ = "recipients"

    name = Column(String(128), nullable=False)
    organization_type = Column(String(64), nullable=False) # Shelter, Community Kitchen, Orphanage, Food Bank, Senior Home, NGO
    distance_km = Column(Float, nullable=False, default=5.0)
    required_quantity = Column(Integer, nullable=False, default=50)
    available_capacity = Column(Integer, nullable=False, default=100)
    food_compatibility = Column(JSON, nullable=False) # List of categories e.g. ["Cooked Meals", "Bakery"]
    current_need_level = Column(String(32), nullable=False, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    availability_hours = Column(String(64), nullable=False, default="08:00 AM - 08:00 PM")
    location = Column(JSON, nullable=False) # {"address": "...", "lat": ..., "lng": ...}
    contact_person = Column(String(128), nullable=False)
    phone = Column(String(64), nullable=False)

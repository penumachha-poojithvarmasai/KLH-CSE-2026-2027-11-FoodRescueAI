from sqlalchemy import Column, String, Float, ForeignKey
from app.core.database import Base
from app.models.base import BaseModelMixin

class PickupTaskModel(Base, BaseModelMixin):
    __tablename__ = "pickup_tasks"

    redistribution_id = Column(String(36), ForeignKey("redistributions.id"), nullable=False, index=True)
    provider_name = Column(String(128), nullable=False)
    recipient_name = Column(String(128), nullable=False)
    pickup_address = Column(String(256), nullable=False)
    destination_address = Column(String(256), nullable=False)
    coordinator_name = Column(String(128), nullable=False)
    driver_phone = Column(String(64), nullable=False)
    current_status = Column(String(32), nullable=False, default="PICKUP_REQUESTED")
    estimated_pickup = Column(String(64), nullable=False)
    estimated_arrival = Column(String(64), nullable=False)
    distance_km = Column(Float, nullable=False, default=5.0)

from sqlalchemy import Column, String, Text, Boolean
from app.core.database import Base
from app.models.base import BaseModelMixin

class NotificationItemModel(Base, BaseModelMixin):
    __tablename__ = "notifications"

    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(32), nullable=False, default="info") # info, success, warning, error
    read = Column(Boolean, nullable=False, default=False)
    target_section = Column(String(64), nullable=False, default="submissions")

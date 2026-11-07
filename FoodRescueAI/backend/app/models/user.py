from sqlalchemy import Column, String
from app.core.database import Base
from app.models.base import BaseModelMixin

class UserModel(Base, BaseModelMixin):
    __tablename__ = "users"

    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=True)
    role = Column(String(64), nullable=False)  # FOOD_PROVIDER, RECIPIENT, LOGISTICS_COORDINATOR, ADMIN
    organization = Column(String(128), nullable=False)
    avatar_url = Column(String(256), nullable=True)

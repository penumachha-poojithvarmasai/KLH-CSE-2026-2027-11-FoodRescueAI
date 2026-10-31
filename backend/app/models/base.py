import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class BaseModelMixin:
    """Base mixin providing UUID, timestamps, and real-world data provenance fields."""
    id = Column(String(36), primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Provenance fields for future web scraping, ingestion, and real-world API data sources
    source_url = Column(String(512), nullable=True)
    source_name = Column(String(128), nullable=True)

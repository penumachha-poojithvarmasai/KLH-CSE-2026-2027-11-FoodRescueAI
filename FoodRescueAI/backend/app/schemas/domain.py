from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# Base Schema with Real-World Ingestion Provenance Fields
class ProvenanceSchema(BaseModel):
    source_url: Optional[str] = Field(default=None, description="URL source of scraped or imported real-world data")
    source_name: Optional[str] = Field(default=None, description="Source organization or crawler name")

# Location Schema
class LocationSchema(BaseModel):
    address: str
    lat: float
    lng: float

# User Schemas
class UserBase(ProvenanceSchema):
    name: str
    email: str
    role: str
    organization: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True


# AI Analysis Schema
class AIAnalysisSchema(BaseModel):
    submissionId: str
    category: str
    quantityAssessment: str
    perishability: str
    urgency: str
    remainingUsableHours: float
    suitability: str
    recommendedRecipients: List[str]
    priorityScore: float
    recommendedAction: str
    pickupRequired: bool
    reasoningSummary: str
    analyzedAt: str

# Food Submission Schemas
class FoodSubmissionBase(ProvenanceSchema):
    provider_id: str
    provider_name: str
    food_name: str
    category: str
    quantity: float
    unit: str
    estimated_servings: int
    preparation_time: str
    expiry_time: str
    storage_condition: str
    location: LocationSchema
    urgency: str = "MEDIUM"
    perishability: str = "MEDIUM"
    remaining_hours: float = 12.0
    notes: Optional[str] = ""
    status: str = "AVAILABLE"
    ai_analysis: Optional[Dict[str, Any]] = None

class FoodSubmissionCreate(FoodSubmissionBase):
    pass

class FoodSubmissionResponse(FoodSubmissionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

# Recipient Schemas
class RecipientBase(ProvenanceSchema):
    name: str
    organization_type: str
    distance_km: float
    required_quantity: int
    available_capacity: int
    food_compatibility: List[str]
    current_need_level: str
    availability_hours: str
    location: LocationSchema
    contact_person: str
    phone: str

class RecipientCreate(RecipientBase):
    pass

class RecipientResponse(RecipientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

# Match Score Breakdown Schema
class MatchScoreBreakdownSchema(BaseModel):
    categoryCompatibilityScore: float
    needLevelScore: float
    capacityMatchScore: float
    distanceScore: float
    availabilityScore: float

# Recipient Match Schemas
class RecipientMatchBase(ProvenanceSchema):
    submission_id: str
    recipient_id: str
    overall_score: float
    breakdown: MatchScoreBreakdownSchema
    suitability_status: str

class RecipientMatchCreate(RecipientMatchBase):
    pass

class RecipientMatchResponse(RecipientMatchBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

# Timeline Entry Schema
class TimelineEntrySchema(BaseModel):
    status: str
    timestamp: str
    note: str

# Redistribution Item Schemas
class RedistributionItemBase(ProvenanceSchema):
    submission_id: str
    matched_recipient_id: Optional[str] = None
    match_score: Optional[float] = None
    status: str = "AVAILABLE"
    timeline: List[TimelineEntrySchema] = []

class RedistributionItemCreate(RedistributionItemBase):
    pass

class RedistributionItemResponse(RedistributionItemBase):
    id: str
    created_at: datetime
    updated_at: datetime
    submission: Optional[FoodSubmissionResponse] = None
    recipient: Optional[RecipientResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True

# Pickup Task Schemas
class PickupTaskBase(ProvenanceSchema):
    redistribution_id: str
    provider_name: str
    recipient_name: str
    pickup_address: str
    destination_address: str
    coordinator_name: str
    driver_phone: str
    current_status: str = "PICKUP_REQUESTED"
    estimated_pickup: str
    estimated_arrival: str
    distance_km: float

class PickupTaskCreate(PickupTaskBase):
    pass

class PickupTaskResponse(PickupTaskBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

# Notification Schemas
class NotificationItemBase(ProvenanceSchema):
    title: str
    message: str
    type: str = "info"
    read: bool = False
    target_section: str = "submissions"

class NotificationItemCreate(NotificationItemBase):
    pass

class NotificationItemResponse(NotificationItemBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

# System Metrics Response
class SystemMetricsResponse(BaseModel):
    totalFoodRecoveredKg: float
    totalMealsSaved: int
    activeDonations: int
    successfulRedistributions: int
    urgentRequests: int
    recipientsServed: int
    foodWastePreventedKg: float
    co2DivertedKg: float
    waterSavedLiters: float
    totalUsersCount: int
    providersCount: int
    recipientsCount: int
    logisticsCount: int

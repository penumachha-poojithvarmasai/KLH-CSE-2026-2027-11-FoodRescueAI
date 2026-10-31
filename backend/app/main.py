from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal


# Import all models to ensure metadata registration before create_all
from app.models import (
    UserModel,
    FoodSubmissionModel,
    RecipientModel,
    RecipientMatchModel,
    RedistributionItemModel,
    PickupTaskModel,
    NotificationItemModel,
)

# Import domain routers (SOA-ready structure)
from app.routers import (
    auth,
    users,
    food,
    recipients,
    matching,
    redistributions,
    pickups,
    notifications,
    metrics,
    seed,
    ai,
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Auto-seed initial demo dataset if database has zero users or legacy geography
try:
    with SessionLocal() as db:
        needs_seed = db.query(UserModel).count() == 0
        if not needs_seed:
            first_rec = db.query(RecipientModel).first()
            if first_rec and isinstance(first_rec.location, dict) and "Bengaluru" in str(first_rec.location.get("address", "")):
                needs_seed = True
        if needs_seed:
            from app.routers.seed import seed_database
            seed_database(db)
except Exception as e:
    print(f"[FoodRescue DB Init] Note: Auto-seed skipped ({e})")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FoodRescue AI FastAPI Backend (Core SOA Domain Services & Models)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(food.router, prefix=api_prefix)
app.include_router(recipients.router, prefix=api_prefix)
app.include_router(matching.router, prefix=api_prefix)
app.include_router(redistributions.router, prefix=api_prefix)
app.include_router(pickups.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(metrics.router, prefix=api_prefix)
app.include_router(seed.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)

@app.get("/health", tags=["Health Check"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": settings.SQLALCHEMY_DATABASE_URI.split("://")[0],
        "step": 1,
        "soa_ready": True
    }


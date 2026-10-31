from typing import Any, Dict
from fastapi import APIRouter, Body
from app.schemas.domain import AIAnalysisSchema
from app.services.ai_service import get_ai_status, analyze_food_submission

router = APIRouter(prefix="/ai", tags=["AI Intelligence Service (Gemini & Fallback)"])

@router.get("/status")
def check_ai_engine_status():
    """
    Returns the real-time status of the Gemini AI integration and active engine.
    """
    return get_ai_status()

@router.post("/analyze", response_model=AIAnalysisSchema)
def analyze_surplus_food(payload: Dict[str, Any] = Body(...)):
    """
    Analyzes surplus food characteristics, estimating perishability, urgency,
    usable lifespan in hours, recipient compatibility, and priority score (0-100).
    Utilizes Google Gemini AI when GEMINI_API_KEY is configured in backend/.env,
    otherwise uses the deterministic RuleEngineFallback.
    """
    result = analyze_food_submission(payload)
    return result

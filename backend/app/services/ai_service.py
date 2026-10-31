import json
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.core.config import settings

logger = logging.getLogger("foodrescue.ai")

class RuleEngineFallback:
    """
    Deterministic rule-based food perishability and urgency evaluation engine.
    Ensures 100% operational reliability and zero downtime without external API dependencies.
    """

    @classmethod
    def get_engine_name(cls) -> str:
        return "Deterministic Rule-Engine (Zero External Dependency Fallback)"

    @classmethod
    def analyze(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        submission_id = str(data.get("id") or data.get("submissionId") or f"sub-{int(datetime.now().timestamp())}")
        category = str(data.get("category") or "Cooked Meals")
        quantity = float(data.get("quantity") or 1.0)
        unit = str(data.get("unit") or "meals")
        estimated_servings = int(data.get("estimated_servings") or data.get("estimatedServings") or quantity)
        storage_condition = str(data.get("storage_condition") or data.get("storageCondition") or "Ambient")
        food_name = str(data.get("food_name") or data.get("foodName") or "Surplus Food Item")

        # 1. Calculate remaining usable hours based on category and storage condition
        remaining_hours = data.get("remaining_hours") or data.get("remainingHours")
        if remaining_hours is not None:
            remaining_usable_hours = float(remaining_hours)
        else:
            if category == "Cooked Meals":
                remaining_usable_hours = 3.0 if storage_condition == "Hot Held" else 6.0 if storage_condition == "Refrigerated" else 2.0
            elif category == "Dairy":
                remaining_usable_hours = 24.0 if storage_condition == "Refrigerated" else 4.0
            elif category == "Bakery":
                remaining_usable_hours = 24.0
            elif category == "Fruits & Vegetables":
                remaining_usable_hours = 48.0
            elif category == "Packaged Food":
                remaining_usable_hours = 72.0
            else:
                remaining_usable_hours = 12.0

        # 2. Determine perishability level
        if category in ["Cooked Meals", "Dairy"]:
            perishability = "CRITICAL" if remaining_usable_hours <= 3.0 else "HIGH"
        elif category == "Bakery":
            perishability = "MEDIUM"
        else:
            perishability = "LOW"

        # 3. Determine urgency level
        if remaining_usable_hours <= 3.0:
            urgency = "CRITICAL"
        elif remaining_usable_hours <= 6.0:
            urgency = "HIGH"
        elif remaining_usable_hours <= 24.0:
            urgency = "MEDIUM"
        else:
            urgency = "LOW"

        # 4. Calculate Priority Score (0 - 100)
        urgency_score = 40 if urgency == "CRITICAL" else 30 if urgency == "HIGH" else 20 if urgency == "MEDIUM" else 10
        perishability_score = 30 if perishability == "CRITICAL" else 25 if perishability == "HIGH" else 15 if perishability == "MEDIUM" else 5
        volume_score = min(30, int(quantity // 5))
        priority_score = float(min(100, max(10, urgency_score + perishability_score + volume_score)))

        # 5. Recommendations and assessments
        quantity_assessment = f"{quantity:g} {unit} (~{estimated_servings} servings) available for immediate dispatch."
        suitability = "Suitable for immediate distribution to Community Shelters, NGO Kitchens, and Food Relief Centers."
        recommended_recipients = [
            "Community Shelters with warm holding capacity",
            "Local NGO Kitchens",
            "Children & Family Centers"
        ]
        recommended_action = (
            "IMMEDIATE_REDISTRIBUTION_DISPATCH"
            if urgency in ["CRITICAL", "HIGH"]
            else "SCHEDULED_STANDARD_PICKUP"
        )
        reasoning_summary = (
            f"[Rule-Engine Analysis] High perishability food item ({food_name}) with {remaining_usable_hours:g}h usable window under {storage_condition} storage. "
            f"Evaluated priority score at {priority_score}/100 with immediate matching dispatch."
        )

        return {
            "submissionId": submission_id,
            "category": category,
            "quantityAssessment": quantity_assessment,
            "perishability": perishability,
            "urgency": urgency,
            "remainingUsableHours": float(remaining_usable_hours),
            "suitability": suitability,
            "recommendedRecipients": recommended_recipients,
            "priorityScore": priority_score,
            "recommendedAction": recommended_action,
            "pickupRequired": True,
            "reasoningSummary": reasoning_summary,
            "analyzedAt": datetime.now(timezone.utc).isoformat()
        }


class GeminiAIService:
    """
    Google Gemini AI Service with automatic failover to RuleEngineFallback.
    Connects to the official Google Gemini API using GEMINI_API_KEY from backend/.env.
    """

    @classmethod
    def is_configured(cls) -> bool:
        key = settings.GEMINI_API_KEY
        if not key:
            return False
        stripped = key.strip()
        return bool(stripped and stripped != "your_gemini_api_key_here")

    @classmethod
    def get_model_name(cls) -> str:
        return settings.GEMINI_MODEL or "gemini-3.8-flash"

    @classmethod
    def get_thinking_level(cls) -> str:
        return getattr(settings, "GEMINI_THINKING_LEVEL", "low") or "low"

    @classmethod
    def get_engine_name(cls) -> str:
        if cls.is_configured():
            return f"Google Gemini ({cls.get_model_name()}) Production Cloud AI"
        return RuleEngineFallback.get_engine_name()

    @classmethod
    def _build_prompt(cls, data: Dict[str, Any]) -> str:
        food_name = str(data.get("food_name") or data.get("foodName") or "Surplus Food")
        category = str(data.get("category") or "Cooked Meals")
        quantity = data.get("quantity") or 1
        unit = str(data.get("unit") or "meals")
        storage = str(data.get("storage_condition") or data.get("storageCondition") or "Ambient")

        details = [
            f"Food: {food_name}",
            f"Category: {category}",
            f"Quantity: {quantity} {unit}",
            f"Storage: {storage}"
        ]
        remaining = data.get("remaining_hours") or data.get("remainingHours")
        if remaining is not None:
            details.append(f"Usable Window Hint: {remaining}h")
        notes = data.get("notes")
        if notes:
            details.append(f"Notes: {str(notes)[:120]}")

        info_str = "\n".join(details)
        return (
            "Analyze this surplus food donation for safety and redistribution priority.\n"
            f"{info_str}\n\n"
            "Return JSON only with these exact fields:\n"
            "{\n"
            '  "perishability": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
            '  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
            '  "remainingUsableHours": number,\n'
            '  "priorityScore": number (0-100),\n'
            '  "recommendedAction": "IMMEDIATE_REDISTRIBUTION_DISPATCH" | "SCHEDULED_STANDARD_PICKUP",\n'
            '  "suitability": "concise recipient suitability sentence",\n'
            '  "recommendedRecipients": ["Recipient Type 1", "Recipient Type 2"],\n'
            '  "reasoningSummary": "one concise reasoning sentence"\n'
            "}"
        )

    @classmethod
    def _call_gemini_api(cls, prompt: str) -> Optional[Dict[str, Any]]:
        api_key = settings.GEMINI_API_KEY
        model = cls.get_model_name()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        request_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
                "thinkingConfig": {
                    "thinkingLevel": cls.get_thinking_level()
                }
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(request_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        timeout_sec = float(getattr(settings, "GEMINI_TIMEOUT_SECONDS", 12.0) or 12.0)
        max_attempts = 2
        for attempt in range(1, max_attempts + 1):
            try:
                with urllib.request.urlopen(req, timeout=timeout_sec) as response:
                    if response.status != 200:
                        logger.warning(f"Gemini API returned HTTP status {response.status}")
                        return None
                    raw_body = response.read().decode("utf-8")
                    res_json = json.loads(raw_body)
                    
                    # Extract candidate content part
                    candidates = res_json.get("candidates", [])
                    if not candidates:
                        return None
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if not parts:
                        return None
                    
                    text = parts[0].get("text", "").strip()
                    # Remove markdown fences if present
                    if text.startswith("```"):
                        lines = text.split("\n")
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].startswith("```"):
                            lines = lines[:-1]
                        text = "\n".join(lines).strip()

                    return json.loads(text)
            except urllib.error.HTTPError as e:
                err_msg = e.read().decode("utf-8", errors="ignore")
                logger.warning(f"Gemini API HTTPError {e.code} (attempt {attempt}/{max_attempts}): {err_msg}")
                if e.code in [503, 429] and attempt < max_attempts:
                    import time
                    time.sleep(1.0)
                    continue
                return None
            except Exception as e:
                logger.warning(f"Gemini API request failed ({type(e).__name__}: {e}) on attempt {attempt}/{max_attempts}")
                if attempt < max_attempts and isinstance(e, (TimeoutError, urllib.error.URLError)):
                    import time
                    time.sleep(0.5)
                    continue
                return None
        return None

    @classmethod
    def analyze(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        submission_id = str(data.get("id") or data.get("submissionId") or f"sub-{int(datetime.now().timestamp())}")
        category = str(data.get("category") or "Cooked Meals")
        quantity = data.get("quantity") or 1
        unit = str(data.get("unit") or "meals")
        estimated_servings = int(data.get("estimated_servings") or data.get("estimatedServings") or quantity)

        # If API key is not configured, directly execute rule engine fallback
        if not cls.is_configured():
            return RuleEngineFallback.analyze(data)

        # When API key is configured, invoke Gemini
        prompt = cls._build_prompt(data)
        parsed_llm = cls._call_gemini_api(prompt)

        # If Gemini API returns valid structured response, format and validate
        if parsed_llm and isinstance(parsed_llm, dict):
            try:
                perishability = parsed_llm.get("perishability", "MEDIUM")
                if perishability not in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
                    perishability = "MEDIUM"

                urgency = parsed_llm.get("urgency", "MEDIUM")
                if urgency not in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
                    urgency = "MEDIUM"

                recipients = parsed_llm.get("recommendedRecipients")
                if not isinstance(recipients, list) or not recipients:
                    recipients = ["Community Shelters", "NGO Food Relief Hubs"]

                raw_score = parsed_llm.get("priorityScore", 75.0)
                try:
                    priority_score = float(max(10, min(100, float(raw_score))))
                except (ValueError, TypeError):
                    priority_score = 75.0

                raw_hours = parsed_llm.get("remainingUsableHours", 4.0)
                try:
                    remaining_hours = float(max(0.5, float(raw_hours)))
                except (ValueError, TypeError):
                    remaining_hours = 4.0

                reasoning = parsed_llm.get("reasoningSummary") or f"AI evaluated {data.get('food_name', 'item')} for immediate dispatch."
                formatted_reasoning = f"[Gemini 3.8 Flash] {reasoning}"

                quantity_assessment = (
                    parsed_llm.get("quantityAssessment")
                    or f"{quantity} {unit} (~{estimated_servings} servings) ready for redistribution."
                )

                return {
                    "submissionId": submission_id,
                    "category": parsed_llm.get("category") or category,
                    "quantityAssessment": quantity_assessment,
                    "perishability": perishability,
                    "urgency": urgency,
                    "remainingUsableHours": remaining_hours,
                    "suitability": parsed_llm.get("suitability") or "Suitable for immediate community redistribution.",
                    "recommendedRecipients": [str(r) for r in recipients],
                    "priorityScore": priority_score,
                    "recommendedAction": parsed_llm.get("recommendedAction") or (
                        "IMMEDIATE_REDISTRIBUTION_DISPATCH" if urgency in ["CRITICAL", "HIGH"] else "SCHEDULED_STANDARD_PICKUP"
                    ),
                    "pickupRequired": bool(parsed_llm.get("pickupRequired", True)),
                    "reasoningSummary": formatted_reasoning,
                    "analyzedAt": datetime.now(timezone.utc).isoformat()
                }
            except Exception as e:
                logger.warning(f"Error structuring Gemini response ({e}), applying fallback.")

        # Graceful fallback if Gemini API call fails or times out
        fallback_res = RuleEngineFallback.analyze(data)
        fallback_res["reasoningSummary"] = (
            f"[Deterministic Fallback] {fallback_res['reasoningSummary']}"
        )
        return fallback_res



def get_ai_status() -> Dict[str, Any]:
    """Returns the operational status of the AI Engine."""
    configured = GeminiAIService.is_configured()
    model = GeminiAIService.get_model_name()
    return {
        "gemini_configured": configured,
        "model": model,
        "active_engine": (
            f"Google Gemini ({model}) Cloud API"
            if configured
            else "Deterministic Rule-Engine (Zero External Dependency Fallback)"
        ),
        "fallback_mode": not configured
    }


def analyze_food_submission(data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyzes a food submission using Gemini (if key configured) or RuleEngineFallback."""
    return GeminiAIService.analyze(data)

import json
import unittest
from unittest.mock import patch, MagicMock
from app.core.config import settings
from app.services.ai_service import (
    RuleEngineFallback,
    GeminiAIService,
    get_ai_status,
    analyze_food_submission
)
from app.routers.ai import check_ai_engine_status, analyze_surplus_food

class TestAIService(unittest.TestCase):
    def setUp(self):
        # Save original settings
        self.original_key = settings.GEMINI_API_KEY
        self.original_model = settings.GEMINI_MODEL
        settings.GEMINI_MODEL = "gemini-3.8-flash"

    def tearDown(self):
        # Restore settings
        settings.GEMINI_API_KEY = self.original_key
        settings.GEMINI_MODEL = self.original_model

    def test_default_model_is_gemini_38_flash(self):
        status = get_ai_status()
        self.assertEqual(status["model"], "gemini-3.8-flash")

    def test_rule_engine_fallback_cooked_meals(self):
        payload = {
            "food_name": "Hot Rice and Dal",
            "category": "Cooked Meals",
            "quantity": 40.0,
            "unit": "meals",
            "storage_condition": "Hot Held",
            "remaining_hours": 3.0
        }
        res = RuleEngineFallback.analyze(payload)
        self.assertEqual(res["category"], "Cooked Meals")
        self.assertEqual(res["urgency"], "CRITICAL")
        self.assertEqual(res["perishability"], "CRITICAL")
        self.assertGreaterEqual(res["priorityScore"], 70)
        self.assertTrue(res["pickupRequired"])
        self.assertIn("Rule-Engine Analysis", res["reasoningSummary"])

    def test_rule_engine_fallback_packaged_food(self):
        payload = {
            "food_name": "Sealed Granola Bars",
            "category": "Packaged Food",
            "quantity": 100.0,
            "unit": "packs",
            "storage_condition": "Ambient"
        }
        res = RuleEngineFallback.analyze(payload)
        self.assertEqual(res["category"], "Packaged Food")
        self.assertEqual(res["urgency"], "LOW")
        self.assertEqual(res["perishability"], "LOW")
        self.assertEqual(res["remainingUsableHours"], 72.0)

    def test_gemini_unconfigured_uses_fallback(self):
        settings.GEMINI_API_KEY = ""
        self.assertFalse(GeminiAIService.is_configured())
        status = get_ai_status()
        self.assertFalse(status["gemini_configured"])
        self.assertTrue(status["fallback_mode"])

        payload = {"food_name": "Bread Loaves", "category": "Bakery", "quantity": 15}
        res = analyze_food_submission(payload)
        self.assertEqual(res["category"], "Bakery")
        self.assertEqual(res["perishability"], "MEDIUM")

    def test_gemini_configured_with_mock_llm_response(self):
        settings.GEMINI_API_KEY = "mock-valid-key"
        self.assertTrue(GeminiAIService.is_configured())
        status = get_ai_status()
        self.assertTrue(status["gemini_configured"])
        self.assertIn("gemini-3.8-flash", status["active_engine"])

        mock_gemini_output = {
            "category": "Cooked Meals",
            "quantityAssessment": "50 meals (~50 servings) hot held and ready.",
            "perishability": "HIGH",
            "urgency": "HIGH",
            "remainingUsableHours": 3.5,
            "suitability": "Ideal for immediate dinner service at community shelter.",
            "recommendedRecipients": ["St. Jude Shelter", "City Hope Kitchen"],
            "priorityScore": 88.0,
            "recommendedAction": "IMMEDIATE_REDISTRIBUTION_DISPATCH",
            "pickupRequired": True,
            "reasoningSummary": "Hot food with less than 4h window requires immediate dispatch."
        }

        with patch.object(GeminiAIService, "_call_gemini_api", return_value=mock_gemini_output):
            payload = {"food_name": "Vegetable Biryani", "category": "Cooked Meals", "quantity": 50}
            res = analyze_food_submission(payload)
            self.assertEqual(res["priorityScore"], 88.0)
            self.assertEqual(res["urgency"], "HIGH")
            self.assertIn("St. Jude Shelter", res["recommendedRecipients"])
            self.assertIn("[Gemini 3.8 Flash]", res["reasoningSummary"])

    def test_gemini_api_failure_graceful_fallback(self):
        settings.GEMINI_API_KEY = "mock-key-causing-error"
        self.assertTrue(GeminiAIService.is_configured())

        # Simulate API returning None due to network or authentication failure
        with patch.object(GeminiAIService, "_call_gemini_api", return_value=None):
            payload = {"food_name": "Cottage Cheese", "category": "Dairy", "quantity": 20, "storage_condition": "Refrigerated"}
            res = analyze_food_submission(payload)
            self.assertEqual(res["category"], "Dairy")
            self.assertIn("[Deterministic Fallback]", res["reasoningSummary"])
            self.assertGreaterEqual(res["priorityScore"], 10)

    def test_router_status_and_analyze(self):
        settings.GEMINI_API_KEY = ""
        status_res = check_ai_engine_status()
        self.assertEqual(status_res["model"], "gemini-3.8-flash")
        self.assertFalse(status_res["gemini_configured"])

        analyze_res = analyze_surplus_food({
            "food_name": "Fresh Apples",
            "category": "Fruits & Vegetables",
            "quantity": 50
        })
        self.assertEqual(analyze_res["category"], "Fruits & Vegetables")
        self.assertEqual(analyze_res["urgency"], "LOW")

if __name__ == "__main__":
    unittest.main()

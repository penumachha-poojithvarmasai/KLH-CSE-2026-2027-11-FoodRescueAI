import io
import json
import unittest
import urllib.error
from unittest.mock import patch, MagicMock
from app.core.config import settings
from app.services.sms_service import TwilioSMSService
from app.routers.notifications import check_sms_gateway_status

class TestTwilioSMSService(unittest.TestCase):
    def setUp(self):
        # Save original settings
        self.orig_sid = settings.TWILIO_ACCOUNT_SID
        self.orig_token = settings.TWILIO_AUTH_TOKEN
        self.orig_phone = settings.TWILIO_PHONE_NUMBER

    def tearDown(self):
        # Restore original settings
        settings.TWILIO_ACCOUNT_SID = self.orig_sid
        settings.TWILIO_AUTH_TOKEN = self.orig_token
        settings.TWILIO_PHONE_NUMBER = self.orig_phone

    def test_unconfigured_gateway_status(self):
        settings.TWILIO_ACCOUNT_SID = None
        settings.TWILIO_AUTH_TOKEN = None
        settings.TWILIO_PHONE_NUMBER = None

        self.assertFalse(TwilioSMSService.is_configured())
        status = TwilioSMSService.get_gateway_status()
        self.assertFalse(status["twilio_configured"])
        self.assertTrue(status["fallback_mode"])
        self.assertIn("Fallback", status["active_gateway"])

    def test_unconfigured_send_sms_skips_gracefully(self):
        settings.TWILIO_ACCOUNT_SID = ""
        settings.TWILIO_AUTH_TOKEN = ""
        settings.TWILIO_PHONE_NUMBER = ""

        res = TwilioSMSService.send_sms(
            to_phone="+919876543210",
            message="Test unconfigured alert"
        )
        self.assertEqual(res["status"], "skipped")
        self.assertIn("not configured", res["reason"])
        self.assertEqual(res["to"], "+919876543210")

    def test_configured_gateway_status_with_masking(self):
        settings.TWILIO_ACCOUNT_SID = "AC_mock_account_sid_12345"
        settings.TWILIO_AUTH_TOKEN = "mock_auth_token_super_secret"
        settings.TWILIO_PHONE_NUMBER = "+15551234567"

        self.assertTrue(TwilioSMSService.is_configured())
        status = TwilioSMSService.get_gateway_status()
        self.assertTrue(status["twilio_configured"])
        self.assertFalse(status["fallback_mode"])
        self.assertIn("Twilio Cloud SMS Gateway", status["active_gateway"])
        # Ensure credentials are not leaked
        self.assertNotIn("mock_auth_token_super_secret", json.dumps(status))
        self.assertNotIn("AC_mock_account_sid_12345", json.dumps(status))
        self.assertEqual(status["sender_masked"], "+155***567")

    def test_configured_send_sms_success_mocked(self):
        settings.TWILIO_ACCOUNT_SID = "AC_mock_account_sid_12345"
        settings.TWILIO_AUTH_TOKEN = "mock_auth_token_super_secret"
        settings.TWILIO_PHONE_NUMBER = "+15551234567"

        mock_twilio_response = {
            "sid": "SM_mock_message_sid_789",
            "status": "queued",
            "to": "+919876543210",
            "from": "+15551234567",
            "body": "Test alert message"
        }

        mock_resp_obj = MagicMock()
        mock_resp_obj.read.return_value = json.dumps(mock_twilio_response).encode("utf-8")
        mock_resp_obj.__enter__.return_value = mock_resp_obj

        with patch("urllib.request.urlopen", return_value=mock_resp_obj) as mock_urlopen:
            res = TwilioSMSService.send_sms(
                to_phone="+919876543210",
                message="Test alert message"
            )
            self.assertEqual(res["status"], "sent")
            self.assertEqual(res["sid"], "SM_mock_message_sid_789")
            self.assertEqual(res["to"], "+919876543210")
            mock_urlopen.assert_called_once()

    def test_twilio_http_error_fails_safely_mocked(self):
        settings.TWILIO_ACCOUNT_SID = "AC_mock_account_sid_12345"
        settings.TWILIO_AUTH_TOKEN = "mock_auth_token_super_secret"
        settings.TWILIO_PHONE_NUMBER = "+15551234567"

        # Simulate Twilio 400 Bad Request (e.g. invalid phone number)
        error_body = json.dumps({"code": 21211, "message": "The 'To' number is invalid."}).encode("utf-8")
        fp = io.BytesIO(error_body)
        http_err = urllib.error.HTTPError(
            url="https://api.twilio.com",
            code=400,
            msg="Bad Request",
            hdrs={},
            fp=fp
        )

        with patch("urllib.request.urlopen", side_effect=http_err):
            res = TwilioSMSService.send_sms(
                to_phone="+910000000000",
                message="Test error alert"
            )
            self.assertEqual(res["status"], "failed")
            self.assertIn("Twilio HTTP 400", res["error"])

    def test_send_redistribution_dispatch_sms_formatting(self):
        settings.TWILIO_ACCOUNT_SID = ""
        settings.TWILIO_AUTH_TOKEN = ""
        settings.TWILIO_PHONE_NUMBER = ""

        with patch.object(TwilioSMSService, "send_sms", return_value={"status": "sent", "sid": "SM123", "to": "+918030143400"}) as mock_send:
            res = TwilioSMSService.send_redistribution_dispatch_sms(
                redistribution_id="red-101",
                recipient_name="The Akshaya Patra Foundation",
                recipient_phone="+918030143400",
                food_name="Vegetable Biryani",
                quantity_str="50 meals",
                provider_name="Grand Horizon Canteen",
                pickup_address="Campus Dining Hall B",
                match_score=94.5
            )
            self.assertEqual(res["status"], "sent")
            mock_send.assert_called_once()
            args, kwargs = mock_send.call_args
            msg = kwargs.get("message") or args[1]
            self.assertIn("Vegetable Biryani", msg)
            self.assertIn("The Akshaya Patra Foundation", msg)
            self.assertIn("Grand Horizon Canteen", msg)
            self.assertIn("94.5%", msg)

    def test_send_urgent_surplus_sms_formatting(self):
        with patch.object(TwilioSMSService, "send_sms", return_value={"status": "sent", "sid": "SM456", "to": "+918022424138"}) as mock_send:
            res = TwilioSMSService.send_urgent_surplus_sms(
                food_name="Hot Held Curry & Rice",
                quantity_str="40 meals",
                remaining_hours=2.5,
                provider_name="Silicon Tech Cafeteria",
                recipient_phone="+918022424138",
                recipient_name="BOSCO Mane"
            )
            self.assertEqual(res["status"], "sent")
            mock_send.assert_called_once()
            args, kwargs = mock_send.call_args
            msg = kwargs.get("message") or args[1]
            self.assertIn("URGENT ALERT", msg)
            self.assertIn("2.5 hours remaining", msg)
            self.assertIn("BOSCO Mane", msg)

    def test_router_sms_status_endpoint(self):
        settings.TWILIO_ACCOUNT_SID = None
        status = check_sms_gateway_status()
        self.assertFalse(status["twilio_configured"])
        self.assertTrue(status["fallback_mode"])

if __name__ == "__main__":
    unittest.main()

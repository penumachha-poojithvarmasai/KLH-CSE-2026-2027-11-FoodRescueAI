import unittest
from unittest.mock import patch, MagicMock
from app.services.email_service import EmailService
from app.core.config import settings

class TestEmailService(unittest.TestCase):

    def setUp(self):
        # Save original settings
        self.orig_host = settings.SMTP_HOST
        self.orig_port = settings.SMTP_PORT
        self.orig_user = settings.SMTP_USER
        self.orig_pwd = settings.SMTP_PASSWORD
        self.orig_from = settings.SMTP_FROM_EMAIL
        self.orig_tls = settings.SMTP_USE_TLS

    def tearDown(self):
        # Restore settings
        settings.SMTP_HOST = self.orig_host
        settings.SMTP_PORT = self.orig_port
        settings.SMTP_USER = self.orig_user
        settings.SMTP_PASSWORD = self.orig_pwd
        settings.SMTP_FROM_EMAIL = self.orig_from
        settings.SMTP_USE_TLS = self.orig_tls

    def test_is_configured_false_when_empty(self):
        settings.SMTP_HOST = None
        self.assertFalse(EmailService.is_configured())

        settings.SMTP_HOST = ""
        self.assertFalse(EmailService.is_configured())

    def test_is_configured_true_when_set(self):
        settings.SMTP_HOST = "smtp.example.com"
        self.assertTrue(EmailService.is_configured())

    def test_get_service_status_unconfigured(self):
        settings.SMTP_HOST = None
        status = EmailService.get_service_status()
        self.assertFalse(status["configured"])
        self.assertEqual(status["status"], "fallback_unconfigured")
        self.assertIsNone(status["smtp_host"])
        self.assertNotIn("password", status)

    def test_get_service_status_configured_masks_user(self):
        settings.SMTP_HOST = "smtp.mailgun.org"
        settings.SMTP_PORT = 587
        settings.SMTP_USER = "postmaster@foodrescue.ai"
        settings.SMTP_PASSWORD = "secretpassword"
        
        status = EmailService.get_service_status()
        self.assertTrue(status["configured"])
        self.assertEqual(status["smtp_host"], "smtp.mailgun.org")
        self.assertIn("po***@foodrescue.ai", status["smtp_user"])
        self.assertNotIn("secretpassword", str(status))

    def test_send_email_skipped_when_unconfigured(self):
        settings.SMTP_HOST = None
        res = EmailService.send_email(
            to_email="recipient@foodrescue.ai",
            subject="Test Subject",
            text_content="Plain text"
        )
        self.assertEqual(res["status"], "skipped")
        self.assertEqual(res["reason"], "email_not_configured")

    def test_send_email_skipped_on_invalid_email(self):
        settings.SMTP_HOST = "smtp.example.com"
        res = EmailService.send_email(
            to_email="invalid-email-address",
            subject="Test",
            text_content="Test"
        )
        self.assertEqual(res["status"], "skipped")
        self.assertEqual(res["reason"], "invalid_or_missing_recipient_email")

    @patch("smtplib.SMTP")
    def test_send_email_success_with_tls_and_login(self, mock_smtp_cls):
        settings.SMTP_HOST = "smtp.example.com"
        settings.SMTP_PORT = 587
        settings.SMTP_USER = "user@example.com"
        settings.SMTP_PASSWORD = "app-password"
        settings.SMTP_USE_TLS = True

        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        res = EmailService.send_email(
            to_email="recipient@foodrescue.ai",
            subject="Food Redistribution Confirmed",
            text_content="Plain text body",
            html_content="<p>HTML body</p>"
        )

        self.assertEqual(res["status"], "sent")
        self.assertEqual(res["recipient"], "recipient@foodrescue.ai")
        mock_smtp_cls.assert_called_once_with("smtp.example.com", 587, timeout=15)
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("user@example.com", "app-password")
        mock_server.send_message.assert_called_once()
        mock_server.quit.assert_called_once()

    @patch("smtplib.SMTP")
    def test_send_email_catches_network_error_safely(self, mock_smtp_cls):
        settings.SMTP_HOST = "smtp.example.com"
        mock_smtp_cls.side_effect = Exception("Connection refused by SMTP server")

        res = EmailService.send_email(
            to_email="recipient@foodrescue.ai",
            subject="Urgent Alert",
            text_content="Plain text"
        )
        self.assertEqual(res["status"], "failed")
        self.assertIn("Connection refused", res["error"])

    def test_send_redistribution_confirmation_email_unconfigured(self):
        settings.SMTP_HOST = None
        results = EmailService.send_redistribution_confirmation_email(
            recipient_email="recipient@foodrescue.ai",
            provider_email="provider@foodrescue.ai",
            recipient_name="Akshaya Patra",
            provider_name="Grand Plaza Hotel",
            food_name="Buffet Surplus Lunch Meals",
            quantity_str="50 meals",
            pickup_address="120 Market St",
            destination_address="72 Industrial Suburb",
            match_score=95.0,
            redistribution_id="redist-101"
        )
        self.assertIn("recipient", results)
        self.assertEqual(results["recipient"]["status"], "skipped")
        self.assertIn("provider", results)
        self.assertEqual(results["provider"]["status"], "skipped")

    def test_send_urgent_surplus_alert_email_unconfigured(self):
        settings.SMTP_HOST = None
        res = EmailService.send_urgent_surplus_alert_email(
            recipient_email="recipient@foodrescue.ai",
            recipient_name="Akshaya Patra",
            food_name="Fresh Cooked Rice & Curry",
            quantity_str="100 kg",
            remaining_hours=3.5,
            provider_name="Grand Plaza Hotel",
            urgency="CRITICAL"
        )
        self.assertEqual(res["status"], "skipped")
        self.assertEqual(res["reason"], "email_not_configured")

    def test_send_status_update_email_unconfigured(self):
        settings.SMTP_HOST = None
        results = EmailService.send_status_update_email(
            recipient_email="recipient@foodrescue.ai",
            provider_email="provider@foodrescue.ai",
            food_name="Fresh Cooked Rice",
            new_status="IN_TRANSIT",
            reference_id="redist-101",
            note="Driver en route"
        )
        self.assertIn("recipient", results)
        self.assertEqual(results["recipient"]["status"], "skipped")

    @patch("smtplib.SMTP")
    def test_send_redistribution_confirmation_email_configured_mocked(self, mock_smtp_cls):
        settings.SMTP_HOST = "smtp.mailgun.org"
        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        results = EmailService.send_redistribution_confirmation_email(
            recipient_email="recipient@foodrescue.ai",
            provider_email="provider@foodrescue.ai",
            recipient_name="Akshaya Patra",
            provider_name="Grand Plaza Hotel",
            food_name="Buffet Surplus Lunch Meals",
            quantity_str="50 meals",
            pickup_address="120 Market St",
            destination_address="72 Industrial Suburb",
            match_score=95.0,
            redistribution_id="redist-101"
        )
        self.assertEqual(results["recipient"]["status"], "sent")
        self.assertEqual(results["provider"]["status"], "sent")
        self.assertEqual(mock_server.send_message.call_count, 2)

    @patch("smtplib.SMTP")
    def test_send_urgent_surplus_alert_email_configured_mocked(self, mock_smtp_cls):
        settings.SMTP_HOST = "smtp.mailgun.org"
        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        res = EmailService.send_urgent_surplus_alert_email(
            recipient_email="recipient@foodrescue.ai",
            recipient_name="Akshaya Patra",
            food_name="Fresh Cooked Rice & Curry",
            quantity_str="100 kg",
            remaining_hours=3.5,
            provider_name="Grand Plaza Hotel",
            urgency="CRITICAL"
        )
        self.assertEqual(res["status"], "sent")
        mock_server.send_message.assert_called_once()

    @patch("smtplib.SMTP")
    def test_send_status_update_email_configured_mocked(self, mock_smtp_cls):
        settings.SMTP_HOST = "smtp.mailgun.org"
        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        results = EmailService.send_status_update_email(
            recipient_email="recipient@foodrescue.ai",
            provider_email="provider@foodrescue.ai",
            food_name="Fresh Cooked Rice",
            new_status="DELIVERED",
            reference_id="redist-101",
            note="Delivered safely to shelter"
        )
        self.assertEqual(results["recipient"]["status"], "sent")
        self.assertEqual(results["provider"]["status"], "sent")
        self.assertEqual(mock_server.send_message.call_count, 2)

    def test_router_check_email_service_status(self):
        from app.routers.notifications import check_email_service_status
        settings.SMTP_HOST = None
        status = check_email_service_status()
        self.assertFalse(status["configured"])
        self.assertEqual(status["status"], "fallback_unconfigured")
        self.assertEqual(status["delivery_mode"], "Safe Mock/In-App Fallback")

        settings.SMTP_HOST = "smtp.gmail.com"
        status_configured = check_email_service_status()
        self.assertTrue(status_configured["configured"])
        self.assertEqual(status_configured["status"], "operational")
        self.assertEqual(status_configured["smtp_host"], "smtp.gmail.com")

if __name__ == "__main__":
    unittest.main()


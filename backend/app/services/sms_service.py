import base64
import json
import logging
import urllib.parse
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("foodrescue.sms")

class TwilioSMSService:
    """
    Twilio SMS Notification Service with automatic fallback.
    Sends real SMS text alerts when Twilio credentials are configured in backend/.env.
    Fails safely and skips delivery when unconfigured or offline without throwing unhandled exceptions.
    """

    @classmethod
    def is_configured(cls) -> bool:
        sid = settings.TWILIO_ACCOUNT_SID
        token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_PHONE_NUMBER
        if not sid or not token or not from_number:
            return False
        # Verify they are not placeholder strings
        sid_s = sid.strip()
        token_s = token.strip()
        from_s = from_number.strip()
        if (
            not sid_s
            or not token_s
            or not from_s
            or "your_" in sid_s
            or "your_" in token_s
            or "your_" in from_s
        ):
            return False
        return True

    @classmethod
    def get_gateway_status(cls) -> Dict[str, Any]:
        configured = cls.is_configured()
        masked_number = None
        if configured and settings.TWILIO_PHONE_NUMBER:
            num = settings.TWILIO_PHONE_NUMBER.strip()
            masked_number = num[:4] + "***" + num[-3:] if len(num) >= 7 else "***"
        return {
            "twilio_configured": configured,
            "sender_configured": bool(settings.TWILIO_PHONE_NUMBER),
            "sender_masked": masked_number,
            "active_gateway": (
                "Twilio Cloud SMS Gateway (Production Live)"
                if configured
                else "In-App Notification Fallback (Zero External Dependency)"
            ),
            "fallback_mode": not configured
        }

    @classmethod
    def send_sms(cls, to_phone: str, message: str) -> Dict[str, Any]:
        """
        Sends an SMS message via Twilio REST API.
        Returns a delivery status dictionary:
          - {"status": "sent", "sid": "...", "to": to_phone}
          - {"status": "skipped", "reason": "...", "to": to_phone}
          - {"status": "failed", "error": "...", "to": to_phone}
        """
        if not to_phone:
            return {"status": "skipped", "reason": "No recipient phone number provided", "to": ""}

        to_phone_clean = to_phone.strip()

        if not cls.is_configured():
            logger.info("Twilio SMS gateway unconfigured; skipping SMS and using in-app notification.")
            return {
                "status": "skipped",
                "reason": "Twilio credentials not configured in backend/.env",
                "to": to_phone_clean
            }

        account_sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
        auth_token = (settings.TWILIO_AUTH_TOKEN or "").strip()
        from_number = (settings.TWILIO_PHONE_NUMBER or "").strip()

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

        # Encode Basic Auth credentials securely
        auth_str = f"{account_sid}:{auth_token}"
        auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("ascii")

        payload_data = urllib.parse.urlencode({
            "To": to_phone_clean,
            "From": from_number,
            "Body": message
        }).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=payload_data,
            headers={
                "Authorization": f"Basic {auth_b64}",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10.0) as response:
                body = response.read().decode("utf-8")
                res_data = json.loads(body)
                sid = res_data.get("sid", "unknown-sid")
                logger.info(f"Twilio SMS dispatched successfully to {to_phone_clean} (SID: {sid})")
                return {
                    "status": "sent",
                    "sid": sid,
                    "to": to_phone_clean
                }
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.warning(f"Twilio SMS HTTP {e.code} delivery error: {err_body[:120]}")
            return {
                "status": "failed",
                "error": f"Twilio HTTP {e.code}: {err_body[:120]}",
                "to": to_phone_clean
            }
        except Exception as e:
            logger.warning(f"Twilio SMS dispatch failed ({type(e).__name__}: {e})")
            return {
                "status": "failed",
                "error": f"{type(e).__name__}: {e}",
                "to": to_phone_clean
            }

    @classmethod
    def send_redistribution_dispatch_sms(
        cls,
        redistribution_id: str,
        recipient_name: str,
        recipient_phone: str,
        food_name: str,
        quantity_str: str,
        provider_name: str,
        pickup_address: str,
        match_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Formats and sends an SMS alert for matched redistribution dispatch.
        """
        score_info = f" (Match Score: {match_score:.1f}%)" if match_score is not None else ""
        msg = (
            f"[FoodRescue AI] Redistribution #{redistribution_id} Dispatched!\n"
            f"• Recipient: {recipient_name}{score_info}\n"
            f"• Item: {food_name} ({quantity_str})\n"
            f"• Provider: {provider_name}\n"
            f"• Pickup Location: {pickup_address}\n"
            f"Please verify intake window. Telemetry tracking: https://foodrescue.ai"
        )
        return cls.send_sms(to_phone=recipient_phone, message=msg)

    @classmethod
    def send_urgent_surplus_sms(
        cls,
        food_name: str,
        quantity_str: str,
        remaining_hours: float,
        provider_name: str,
        recipient_phone: str,
        recipient_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Formats and sends an urgent priority SMS alert when surplus food requires immediate rescue.
        """
        target = f"Allocated to: {recipient_name}" if recipient_name else "Immediate distribution required"
        msg = (
            f"[FoodRescue AI URGENT ALERT] Immediate Rescue Needed!\n"
            f"• Item: {food_name} ({quantity_str})\n"
            f"• Usable Window: {remaining_hours:g} hours remaining\n"
            f"• Provider: {provider_name}\n"
            f"• {target}\n"
            f"Action: Logistics coordinator dispatched."
        )
        return cls.send_sms(to_phone=recipient_phone, message=msg)

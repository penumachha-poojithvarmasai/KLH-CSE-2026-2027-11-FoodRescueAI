import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger("foodrescue.email_service")

class EmailService:
    """
    Native Python SMTP Email Service for FoodRescue AI.
    Uses standard library smtplib, ssl, and email.mime without external dependencies.
    Provides graceful fallbacks when unconfigured or on network/SMTP delivery errors.
    """

    @classmethod
    def is_configured(cls) -> bool:
        """
        Returns True if SMTP_HOST is configured.
        """
        return bool(settings.SMTP_HOST and settings.SMTP_HOST.strip())

    @classmethod
    def get_service_status(cls) -> Dict[str, Any]:
        """
        Returns the safe diagnostic status of the Email Service.
        Never exposes SMTP passwords or credentials.
        """
        configured = cls.is_configured()
        from_addr = settings.SMTP_FROM_EMAIL or settings.SMTP_USER or "no-reply@foodrescue.ai"
        
        # Mask username if set
        masked_user = None
        if settings.SMTP_USER:
            parts = settings.SMTP_USER.split("@")
            if len(parts) == 2:
                prefix = parts[0]
                masked_prefix = prefix[:2] + "***" if len(prefix) > 2 else "***"
                masked_user = f"{masked_prefix}@{parts[1]}"
            else:
                masked_user = settings.SMTP_USER[:2] + "***"

        return {
            "configured": configured,
            "status": "operational" if configured else "fallback_unconfigured",
            "smtp_host": settings.SMTP_HOST if configured else None,
            "smtp_port": settings.SMTP_PORT,
            "from_email": from_addr if configured else None,
            "smtp_user": masked_user if configured else None,
            "use_tls": settings.SMTP_USE_TLS,
            "provider_type": "Standard SMTP (TLS/SSL)",
            "delivery_mode": "Live SMTP Dispatch" if configured else "Safe Mock/In-App Fallback"
        }

    @classmethod
    def send_email(
        cls,
        to_email: str,
        subject: str,
        text_content: str,
        html_content: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an email using standard SMTP.
        Fails safely if SMTP is unconfigured or if an error occurs during delivery.
        """
        if not cls.is_configured():
            return {
                "status": "skipped",
                "reason": "email_not_configured",
                "recipient": to_email,
                "subject": subject
            }

        if not to_email or "@" not in to_email or "." not in to_email:
            return {
                "status": "skipped",
                "reason": "invalid_or_missing_recipient_email",
                "recipient": to_email
            }

        from_addr = settings.SMTP_FROM_EMAIL or settings.SMTP_USER or "notifications@foodrescue.ai"

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"FoodRescue AI Platform <{from_addr}>"
            msg["To"] = to_email
            msg["Date"] = formatdate(localtime=True)

            # Plain text part
            part1 = MIMEText(text_content, "plain", "utf-8")
            msg.attach(part1)

            # HTML part if provided
            if html_content:
                part2 = MIMEText(html_content, "html", "utf-8")
                msg.attach(part2)

            # Create SMTP connection
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            
            if settings.SMTP_USE_TLS:
                context = ssl.create_default_context()
                server.starttls(context=context)

            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

            server.send_message(msg)
            server.quit()

            logger.info(f"Successfully sent email to {to_email}: {subject}")
            return {
                "status": "sent",
                "recipient": to_email,
                "subject": subject
            }

        except Exception as exc:
            logger.warning(f"SMTP Email delivery failed to {to_email}: {exc}")
            return {
                "status": "failed",
                "recipient": to_email,
                "error": str(exc)
            }

    @classmethod
    def send_redistribution_confirmation_email(
        cls,
        recipient_email: Optional[str],
        provider_email: Optional[str],
        recipient_name: str,
        provider_name: str,
        food_name: str,
        quantity_str: str,
        pickup_address: str,
        destination_address: str,
        match_score: float,
        redistribution_id: str
    ) -> Dict[str, Any]:
        """
        Sends formatted donation confirmation and dispatch receipts to the recipient and provider.
        """
        subject = f"🌱 FoodRescue AI: Redistribution Confirmed for '{food_name}'"
        
        text_content = f"""
=====================================================
FOODRESCUE AI - REDISTRIBUTION CONFIRMATION
=====================================================
Reference ID : {redistribution_id}
Food Donation: {food_name} ({quantity_str})
Match Score  : {match_score:.0f}% AI Compatibility Score

DONATION DETAILS:
- Food Provider : {provider_name}
- Recipient NGO : {recipient_name}
- Pickup Point  : {pickup_address}
- Destination   : {destination_address}

LOGISTICS NOTICE:
Logistics dispatch and route optimization have been initiated.
Please ensure safe food handling standards upon handoff and arrival.

FoodRescue AI Platform - Zero Waste, Zero Hunger
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
    .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 24px; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
    .header p {{ margin: 4px 0 0 0; opacity: 0.9; font-size: 14px; }}
    .body {{ padding: 24px; }}
    .badge {{ display: inline-block; background: #ecfdf5; color: #047857; font-weight: 600; font-size: 13px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0; margin-bottom: 16px; }}
    .info-table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    .info-table td {{ padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
    .info-label {{ color: #64748b; width: 35%; font-weight: 500; }}
    .info-val {{ color: #0f172a; font-weight: 600; }}
    .footer {{ background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🌱 FoodRescue AI — Redistribution Match</h1>
      <p>Automated Food Surplus Dispatch & Receipt</p>
    </div>
    <div class="body">
      <div class="badge">Match Score: {match_score:.0f}% Compatibility</div>
      <p style="margin-top: 0; font-size: 15px; line-height: 1.5;">
        A surplus food donation has been successfully matched and scheduled for redistribution.
      </p>
      <table class="info-table">
        <tr>
          <td class="info-label">Donated Item</td>
          <td class="info-val">{food_name} ({quantity_str})</td>
        </tr>
        <tr>
          <td class="info-label">Food Provider</td>
          <td class="info-val">{provider_name}</td>
        </tr>
        <tr>
          <td class="info-label">Recipient Partner</td>
          <td class="info-val">{recipient_name}</td>
        </tr>
        <tr>
          <td class="info-label">Pickup Location</td>
          <td class="info-val">{pickup_address}</td>
        </tr>
        <tr>
          <td class="info-label">Destination</td>
          <td class="info-val">{destination_address}</td>
        </tr>
        <tr>
          <td class="info-label">Dispatch ID</td>
          <td class="info-val" style="font-family: monospace; font-size: 12px;">{redistribution_id}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      FoodRescue AI Orchestration Platform &bull; Sustainable Surplus Redistribution
    </div>
  </div>
</body>
</html>
"""
        results = {}
        if recipient_email:
            results["recipient"] = cls.send_email(recipient_email, subject, text_content, html_content)
        if provider_email:
            results["provider"] = cls.send_email(provider_email, subject, text_content, html_content)
        
        return results

    @classmethod
    def send_urgent_surplus_alert_email(
        cls,
        recipient_email: Optional[str],
        recipient_name: str,
        food_name: str,
        quantity_str: str,
        remaining_hours: float,
        provider_name: str,
        urgency: str
    ) -> Dict[str, Any]:
        """
        Sends an urgent email alert to a recipient organization for critical perishables.
        """
        subject = f"🚨 URGENT: Food Surplus Available — '{food_name}' ({urgency} Urgency)"
        
        text_content = f"""
=====================================================
FOODRESCUE AI - CRITICAL SURPLUS FOOD ALERT
=====================================================
URGENCY LEVEL   : {urgency}
REMAINING WINDOW: ~{remaining_hours:g} Hours Usable

SURPLUS DETAILS:
- Food Item     : {food_name} ({quantity_str})
- Donating Org  : {provider_name}
- Target Partner: {recipient_name}

ACTION RECOMMENDED:
Please check your FoodRescue AI recipient portal to review and accept the donation for expedited pickup.

FoodRescue AI Platform - Rapid Redistribution Agent
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
    .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #fee2e2; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; padding: 24px; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
    .header p {{ margin: 4px 0 0 0; opacity: 0.9; font-size: 14px; }}
    .body {{ padding: 24px; }}
    .badge {{ display: inline-block; background: #fef2f2; color: #b91c1c; font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #fecaca; margin-bottom: 16px; }}
    .info-table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    .info-table td {{ padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
    .info-label {{ color: #64748b; width: 35%; font-weight: 500; }}
    .info-val {{ color: #0f172a; font-weight: 600; }}
    .footer {{ background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚨 Urgent Surplus Food Alert</h1>
      <p>Immediate Redistribution Opportunity</p>
    </div>
    <div class="body">
      <div class="badge">URGENCY: {urgency} &bull; ~{remaining_hours:g} Hours Usable</div>
      <p style="margin-top: 0; font-size: 15px; line-height: 1.5;">
        A high-perishability food batch has just been submitted and requires rapid dispatch.
      </p>
      <table class="info-table">
        <tr>
          <td class="info-label">Food Item</td>
          <td class="info-val">{food_name} ({quantity_str})</td>
        </tr>
        <tr>
          <td class="info-label">Provider</td>
          <td class="info-val">{provider_name}</td>
        </tr>
        <tr>
          <td class="info-label">Designated Partner</td>
          <td class="info-val">{recipient_name}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      FoodRescue AI Orchestration Platform &bull; Emergency Surplus Response
    </div>
  </div>
</body>
</html>
"""
        if recipient_email:
            return cls.send_email(recipient_email, subject, text_content, html_content)
        return {"status": "skipped", "reason": "no_recipient_email"}

    @classmethod
    def send_status_update_email(
        cls,
        recipient_email: Optional[str],
        provider_email: Optional[str],
        food_name: str,
        new_status: str,
        reference_id: str,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends delivery progress updates (IN_TRANSIT, DELIVERED) to relevant parties.
        """
        status_readable = new_status.replace("_", " ").title()
        subject = f"📦 FoodRescue AI Status Update: '{food_name}' is {status_readable}"
        
        text_content = f"""
=====================================================
FOODRESCUE AI - LOGISTICS STATUS UPDATE
=====================================================
Reference ID : {reference_id}
Food Item    : {food_name}
New Status   : {status_readable}
Note         : {note or 'Logistics tracking updated successfully.'}

FoodRescue AI Platform - Automated Fleet & Logistics Orchestration
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
    .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; padding: 24px; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
    .header p {{ margin: 4px 0 0 0; opacity: 0.9; font-size: 14px; }}
    .body {{ padding: 24px; }}
    .badge {{ display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 600; font-size: 13px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe; margin-bottom: 16px; }}
    .info-table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
    .info-table td {{ padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
    .info-label {{ color: #64748b; width: 35%; font-weight: 500; }}
    .info-val {{ color: #0f172a; font-weight: 600; }}
    .footer {{ background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>📦 Logistics Status Update</h1>
      <p>FoodRescue AI Real-Time Dispatch Tracking</p>
    </div>
    <div class="body">
      <div class="badge">STATUS: {status_readable}</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Food Item</td>
          <td class="info-val">{food_name}</td>
        </tr>
        <tr>
          <td class="info-label">Status</td>
          <td class="info-val">{status_readable}</td>
        </tr>
        <tr>
          <td class="info-label">Tracking ID</td>
          <td class="info-val" style="font-family: monospace; font-size: 12px;">{reference_id}</td>
        </tr>
        <tr>
          <td class="info-label">Notes</td>
          <td class="info-val">{note or 'Status progressed automatically.'}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      FoodRescue AI Logistics Orchestration
    </div>
  </div>
</body>
</html>
"""
        results = {}
        if recipient_email:
            results["recipient"] = cls.send_email(recipient_email, subject, text_content, html_content)
        if provider_email:
            results["provider"] = cls.send_email(provider_email, subject, text_content, html_content)
        
        return results

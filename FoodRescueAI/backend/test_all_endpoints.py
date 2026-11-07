import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 500, str(e)

def test_full_api_suite():
    results = []
    
    # 1. Health check
    status, body = make_req("/health")
    results.append(("GET /health", "PASS" if status == 200 else "FAIL", f"Status: {status}"))
    
    # 2. Database seed
    status, body = make_req("/seed", method="POST")
    results.append(("POST /seed", "PASS" if status == 200 else "FAIL", f"Status: {status}"))
    
    # 3. Auth login as Provider
    status, body = make_req("/auth/login", method="POST", data={"email": "provider@foodrescue.ai", "password": "provider123"})
    provider_token = body.get("token") if status == 200 and isinstance(body, dict) else None
    results.append(("POST /auth/login (Provider)", "PASS" if provider_token else "FAIL", f"Token: {bool(provider_token)}"))
    
    # 4. Get food submissions
    status, body = make_req("/food/submissions")
    subs_count = len(body) if status == 200 and isinstance(body, list) else 0
    results.append(("GET /food/submissions", "PASS" if status == 200 and subs_count > 0 else "FAIL", f"Count: {subs_count}"))
    
    # 5. Post a new food submission with valid schema
    now = datetime.now()
    new_sub_data = {
        "provider_id": "usr-prov-001",
        "provider_name": "Grand Horizon Canteen",
        "food_name": "Fresh Buffet Rice & Vegetable Curry",
        "category": "Cooked Meals",
        "quantity": 50.0,
        "unit": "meals",
        "estimated_servings": 50,
        "preparation_time": (now - timedelta(hours=1)).isoformat(),
        "expiry_time": (now + timedelta(hours=3)).isoformat(),
        "storage_condition": "Hot Held",
        "location": {
            "address": "Mindspace IT Park, Madhapur, Hyderabad",
            "lat": 17.4401,
            "lng": 78.3802
        },
        "remaining_hours": 3.0,
        "urgency": "HIGH",
        "perishability": "HIGH",
        "notes": "Maintained in warmers above 65°C."
    }
    status, body = make_req("/food/submissions", method="POST", data=new_sub_data, token=provider_token)
    results.append(("POST /food/submissions", "PASS" if status in [200, 201] else "FAIL", f"Status: {status}"))
    
    # 6. Get recipients
    status, body = make_req("/recipients")
    recip_count = len(body) if status == 200 and isinstance(body, list) else 0
    results.append(("GET /recipients", "PASS" if status == 200 and recip_count > 0 else "FAIL", f"Count: {recip_count}"))
    
    # 7. Get redistributions
    status, body = make_req("/redistributions")
    redist_count = len(body) if status == 200 and isinstance(body, list) else 0
    results.append(("GET /redistributions", "PASS" if status == 200 and redist_count > 0 else "FAIL", f"Count: {redist_count}"))
    
    # 8. Get pickups
    status, body = make_req("/pickups")
    pickups_count = len(body) if status == 200 and isinstance(body, list) else 0
    results.append(("GET /pickups", "PASS" if status == 200 and pickups_count > 0 else "FAIL", f"Count: {pickups_count}"))
    
    # 9. Get notifications
    status, body = make_req("/notifications")
    notif_count = len(body) if status == 200 and isinstance(body, list) else 0
    results.append(("GET /notifications", "PASS" if status == 200 and notif_count > 0 else "FAIL", f"Count: {notif_count}"))
    
    # 10. Get metrics
    status, body = make_req("/metrics")
    has_metrics = status == 200 and isinstance(body, dict) and "totalMealsSaved" in body
    results.append(("GET /metrics", "PASS" if has_metrics else "FAIL", f"Meals: {body.get('totalMealsSaved') if isinstance(body, dict) else None}"))

    # 11. SMS Gateway Status
    status, body = make_req("/notifications/sms/status")
    has_sms_status = status == 200 and isinstance(body, dict) and ("twilio_configured" in body or "configured" in body)
    is_conf = body.get("twilio_configured") if "twilio_configured" in body else body.get("configured")
    active_gw = body.get("active_gateway") or body.get("status")
    results.append(("GET /notifications/sms/status", "PASS" if has_sms_status else "FAIL", f"Twilio Configured: {is_conf}, Gateway: {active_gw}"))

    # 12. Email Service Status
    status, body = make_req("/notifications/email/status")
    has_email_status = status == 200 and isinstance(body, dict) and "configured" in body
    results.append(("GET /notifications/email/status", "PASS" if has_email_status else "FAIL", f"Configured: {body.get('configured') if isinstance(body, dict) else None}, Status: {body.get('status') if isinstance(body, dict) else None}"))

    # 13. AI Engine Status (Gemini 3.8 Flash & Fallback)
    status, body = make_req("/ai/status")
    has_ai_status = status == 200 and isinstance(body, dict) and body.get("model") == "gemini-3.8-flash"
    results.append(("GET /ai/status", "PASS" if has_ai_status else "FAIL", f"Model: {body.get('model') if isinstance(body, dict) else None}, Engine: {body.get('active_engine') if isinstance(body, dict) else None}"))

    # 14. AI Analysis on Food Payload (Gemini or Deterministic Fallback)
    ai_test_payload = {
        "food_name": "Hot Canteen Vegetable Pulao",
        "category": "Cooked Meals",
        "quantity": 30.0,
        "unit": "meals",
        "storage_condition": "Hot Held",
        "remaining_hours": 3.0
    }
    status, body = make_req("/ai/analyze", method="POST", data=ai_test_payload)
    has_ai_analysis = status == 200 and isinstance(body, dict) and "priorityScore" in body and "perishability" in body
    results.append(("POST /ai/analyze", "PASS" if has_ai_analysis else "FAIL", f"Score: {body.get('priorityScore') if isinstance(body, dict) else None}, Urgency: {body.get('urgency') if isinstance(body, dict) else None}"))
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test_full_api_suite()

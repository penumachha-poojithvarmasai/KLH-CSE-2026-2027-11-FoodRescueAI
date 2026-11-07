import urllib.request, urllib.error, json

BASE = 'http://127.0.0.1:8000/api/v1'

def req(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    encoded = json.dumps(data).encode('utf-8') if data else None
    r = urllib.request.Request(url, data=encoded, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

print("--- Testing Approval Persistence & Deduplication ---")

# 1. Login provider to get credentials/token if needed
_, prov_login = req(f'{BASE}/auth/login', 'POST', {'email': 'provider@foodrescue.ai', 'password': 'provider123'})
prov_token = prov_login.get('token')

# 2. Create a fresh test food submission
test_sub_payload = {
    "provider_id": "usr-1",
    "provider_name": "Grand Plaza Hotel",
    "food_name": "Test Biryani Persistence Batch",
    "category": "Cooked Meals",
    "quantity": 30.0,
    "unit": "meals",
    "estimated_servings": 30,
    "preparation_time": "2026-09-26T12:00:00Z",
    "expiry_time": "2026-09-26T18:00:00Z",
    "storage_condition": "Hot Held",
    "location": {"address": "Cyber Gateway, HITEC City, Hyderabad", "lat": 17.4483, "lng": 78.3748},
    "urgency": "HIGH",
    "perishability": "HIGH",
    "remaining_hours": 4.0,
    "notes": "Testing approval persistence",
    "status": "AVAILABLE"
}

code, sub_created = req(f'{BASE}/food/submissions', 'POST', test_sub_payload, token=prov_token)
assert code == 201, f"Expected 201, got {code}"
sub_id = sub_created['id']
print(f"[1] Created test submission {sub_id}, initial status: {sub_created['status']}")
assert sub_created['status'] == 'AVAILABLE'

# 3. Approve dispatch to rec-1
redist_payload = {
    "submission_id": sub_id,
    "matched_recipient_id": "rec-1",
    "match_score": 94.0,
    "status": "MATCHED",
    "timeline": [
        {"status": "AVAILABLE", "timestamp": "2026-09-26T12:00:00Z", "note": "Food logged"},
        {"status": "MATCHED", "timestamp": "2026-09-26T12:05:00Z", "note": "Approved dispatch to rec-1"}
    ]
}

code_red1, red1 = req(f'{BASE}/redistributions', 'POST', redist_payload, token=prov_token)
assert code_red1 in [200, 201], f"Expected 200/201, got {code_red1}"
red1_id = red1['id']
print(f"[2] Created redistribution {red1_id}, status: {red1['status']}")
assert red1['status'] == 'MATCHED'

# Check that food submission status was updated in SQLite
code_get_sub, sub_check = req(f'{BASE}/food/submissions/{sub_id}')
assert code_get_sub == 200
print(f"[3] Food submission status in SQLite after dispatch: {sub_check['status']}")
assert sub_check['status'] == 'MATCHED', f"Expected MATCHED, got {sub_check['status']}"

# Create pickup task
pickup_payload = {
    "redistribution_id": red1_id,
    "provider_name": "Grand Plaza Hotel",
    "recipient_name": "The Akshaya Patra Foundation",
    "pickup_address": "Cyber Gateway, HITEC City, Hyderabad",
    "destination_address": "Akshaya Patra Mega Kitchen, Narsingi, Hyderabad",
    "coordinator_name": "Logistics Bot",
    "driver_phone": "+91 98765 00000",
    "current_status": "PICKUP_REQUESTED",
    "estimated_pickup": "15:00",
    "estimated_arrival": "15:45",
    "distance_km": 4.5
}
code_pk1, pk1 = req(f'{BASE}/pickups', 'POST', pickup_payload)
assert code_pk1 in [200, 201]
pk1_id = pk1['id']
print(f"[4] Created pickup task {pk1_id}")

# 4. Attempt accidental second click on Approve Dispatch (duplicate prevention test)
code_red2, red2 = req(f'{BASE}/redistributions', 'POST', redist_payload, token=prov_token)
print(f"[5] Second Approve Dispatch call returned ID {red2['id']}")
assert red2['id'] == red1_id, f"Expected duplicate prevention to return same ID {red1_id}, got {red2['id']}"

code_pk2, pk2 = req(f'{BASE}/pickups', 'POST', pickup_payload)
assert pk2['id'] == pk1_id, f"Expected duplicate pickup prevention to return same ID {pk1_id}, got {pk2['id']}"
print(f"[6] Second Pickup task call returned same ID {pk2['id']}")

# 5. Verify total redistributions for sub_id is exactly 1
_, all_redists = req(f'{BASE}/redistributions')
matching_redists = [r for r in all_redists if r['submission_id'] == sub_id]
print(f"[7] Matching redistributions for sub_id count: {len(matching_redists)}")
assert len(matching_redists) == 1, f"Expected exactly 1 redistribution, got {len(matching_redists)}"

# 6. Verify food submission still has MATCHED status
_, all_subs = req(f'{BASE}/food/submissions')
persisted_sub = next(s for s in all_subs if s['id'] == sub_id)
print(f"[8] Final persisted food submission status: {persisted_sub['status']}")
assert persisted_sub['status'] == 'MATCHED'

print("\n--- ALL APPROVAL PERSISTENCE & DEDUPLICATION CHECKS PASSED! ---")

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

# 1. Login logistics & provider
_, log_login = req(f'{BASE}/auth/login', 'POST', {'email': 'logistics@foodrescue.ai', 'password': 'logistics123'})
log_token = log_login['token']

_, prov_login = req(f'{BASE}/auth/login', 'POST', {'email': 'provider@foodrescue.ai', 'password': 'provider123'})
prov_token = prov_login['token']

# 2. Get redistributions
st, redists = req(f'{BASE}/redistributions', token=log_token)
assert st == 200, f'Expected 200, got {st}'
assert len(redists) > 0, 'No redistributions returned'
item = redists[0]
item_id = item['id']
print('[CHECK 1] Hydration check:')
print('  ID:', item_id)
print('  Submission food_name:', item['submission']['food_name'])
print('  Recipient name:', item['recipient']['name'])
assert item['submission'] is not None, 'Submission is None!'
assert item['recipient'] is not None, 'Recipient is None!'

# 3. Provider attempt update -> Expected 403 Forbidden
st_p, res_p = req(f'{BASE}/redistributions/{item_id}/status?status_val=IN_TRANSIT', 'PATCH', token=prov_token)
print('[CHECK 2] Food Provider 403 check:', st_p, res_p.get('detail'))
assert st_p == 403, f'Expected 403 for FOOD_PROVIDER, got {st_p}'

# 4. Logistics Coordinator attempt update -> Expected 200 OK
st_l, res_l = req(f'{BASE}/redistributions/{item_id}/status?status_val=IN_TRANSIT&note=Dispatched+by+James', 'PATCH', token=log_token)
print('[CHECK 3] Logistics Coordinator 200 check:', st_l, res_l.get('status'))
assert st_l == 200, f'Expected 200 for LOGISTICS_COORDINATOR, got {st_l}'
assert res_l['status'] == 'IN_TRANSIT', f'Expected status IN_TRANSIT, got {res_l["status"]}'
assert res_l['submission'] is not None, 'Hydrated submission missing in PATCH response'

# 5. Check DB sync with pickup & submission
_, pickups = req(f'{BASE}/pickups')
matching_pk = [p for p in pickups if p['redistribution_id'] == item_id]
if matching_pk:
    print('[CHECK 4] Pickup sync check:', matching_pk[0]['current_status'])
    assert matching_pk[0]['current_status'] == 'IN_TRANSIT'

_, subs = req(f'{BASE}/food/submissions')
matching_sub = [s for s in subs if s['id'] == item['submission_id']]
if matching_sub:
    print('[CHECK 5] Food Submission sync check:', matching_sub[0]['status'])
    assert matching_sub[0]['status'] == 'IN_TRANSIT'

print('\nALL REDISTRIBUTION FLOW VERIFICATION CHECKS PASSED!')

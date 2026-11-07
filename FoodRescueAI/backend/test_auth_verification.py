import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = {"raw": res_body}
        return e.code, parsed

def run_tests():
    results = []

    # Test 0: Seed Database
    status, res = make_request(f"{BASE_URL}/seed", method="POST")
    if status == 200:
        results.append(("Database Seeding", "PASS", f"Status: {status}"))
    else:
        results.append(("Database Seeding", "FAIL", f"Status: {status}, Error: {res}"))

    roles_to_test = [
        ("FOOD_PROVIDER", "provider@foodrescue.ai", "provider123"),
        ("RECIPIENT", "recipient@foodrescue.ai", "recipient123"),
        ("LOGISTICS_COORDINATOR", "logistics@foodrescue.ai", "logistics123"),
        ("ADMIN", "admin@foodrescue.ai", "admin123")
    ]

    tokens = {}

    # Test 1: Login for 4 roles
    for role_name, email, password in roles_to_test:
        status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": email, "password": password})
        if status == 200 and "token" in res and res.get("user", {}).get("role") == role_name:
            tokens[role_name] = res["token"]
            results.append((f"Login for {role_name} ({email})", "PASS", f"Token received, Role matched"))
        else:
            results.append((f"Login for {role_name} ({email})", "FAIL", f"Status: {status}, Detail: {res}"))

    # Test 2: Verify /auth/me for each returned JWT
    for role_name, token in tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        status, res = make_request(f"{BASE_URL}/auth/me", method="GET", headers=headers)
        if status == 200 and res.get("role") == role_name:
            results.append((f"/auth/me Verification for {role_name}", "PASS", f"User profile fetched: {res.get('email')}"))
        else:
            results.append((f"/auth/me Verification for {role_name}", "FAIL", f"Status: {status}, Detail: {res}"))

    # Test 3: Invalid Credentials
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": "provider@foodrescue.ai", "password": "wrongpassword123"})
    if status == 401:
        results.append(("Invalid Credentials Protection", "PASS", f"HTTP {status} Unauthorized as expected"))
    else:
        results.append(("Invalid Credentials Protection", "FAIL", f"Expected HTTP 401, got {status}: {res}"))

    # Test 4: Non-Admin receives 403 on Admin-only endpoint GET /users
    if "FOOD_PROVIDER" in tokens:
        headers = {"Authorization": f"Bearer {tokens['FOOD_PROVIDER']}"}
        status, res = make_request(f"{BASE_URL}/users", method="GET", headers=headers)
        if status == 403:
            results.append(("Non-Admin 403 Forbidden Enforcement on GET /users", "PASS", f"HTTP 403 Forbidden as expected"))
        else:
            results.append(("Non-Admin 403 Forbidden Enforcement on GET /users", "FAIL", f"Expected HTTP 403, got {status}: {res}"))
    else:
        results.append(("Non-Admin 403 Forbidden Enforcement on GET /users", "FAIL", "No provider token available"))

    # Test 5: Admin receives 200 OK on Admin-only endpoint GET /users
    if "ADMIN" in tokens:
        headers = {"Authorization": f"Bearer {tokens['ADMIN']}"}
        status, res = make_request(f"{BASE_URL}/users", method="GET", headers=headers)
        if status == 200 and isinstance(res, list):
            results.append(("Admin 200 OK Authorization on GET /users", "PASS", f"HTTP 200 OK, retrieved {len(res)} users"))
        else:
            results.append(("Admin 200 OK Authorization on GET /users", "FAIL", f"Expected HTTP 200, got {status}: {res}"))
    # Test 6: Public Registration rejects ADMIN role with 403 Forbidden
    status, res = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        data={
            "name": "Malicious Admin Registration",
            "email": "malicious_admin@test.org",
            "password": "pass123",
            "role": "ADMIN",
            "organization": "Test Corp"
        }
    )
    if status == 403:
        results.append(("Public Registration Rejects ADMIN Role", "PASS", f"HTTP 403 Forbidden: {res.get('detail')}"))
    else:
        results.append(("Public Registration Rejects ADMIN Role", "FAIL", f"Expected HTTP 403, got {status}: {res}"))

    # Test 7: Public Registration allows valid role (FOOD_PROVIDER) and returns JWT
    test_reg_email = f"public_provider_{int(__import__('time').time())}@test.org"
    status, res = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        data={
            "name": "Public Self Registered Provider",
            "email": test_reg_email,
            "password": "pass123",
            "role": "FOOD_PROVIDER",
            "organization": "Fresh Meals Kitchen"
        }
    )
    if status == 201 and "token" in res and res.get("user", {}).get("role") == "FOOD_PROVIDER":
        results.append(("Public Registration Allows Valid Role (FOOD_PROVIDER)", "PASS", f"HTTP 201 Created with JWT"))
    else:
        results.append(("Public Registration Allows Valid Role (FOOD_PROVIDER)", "FAIL", f"Expected HTTP 201, got {status}: {res}"))

    # Test 8: Non-Admin receives 403 on Admin-only endpoint POST /users
    if "FOOD_PROVIDER" in tokens:
        headers = {"Authorization": f"Bearer {tokens['FOOD_PROVIDER']}"}
        status, res = make_request(
            f"{BASE_URL}/users",
            method="POST",
            headers=headers,
            data={
                "name": "Blocked User",
                "email": "blocked@test.org",
                "password": "pass123",
                "role": "RECIPIENT",
                "organization": "Blocked NGO"
            }
        )
        if status == 403:
            results.append(("Non-Admin 403 Forbidden on POST /users", "PASS", f"HTTP 403 Forbidden as expected"))
        else:
            results.append(("Non-Admin 403 Forbidden on POST /users", "FAIL", f"Expected HTTP 403, got {status}: {res}"))
    else:
        results.append(("Non-Admin 403 Forbidden on POST /users", "FAIL", "No provider token available"))

    # Test 9: Admin successfully creates user on POST /users (legitimate Admin user management, including ADMIN role)
    if "ADMIN" in tokens:
        headers = {"Authorization": f"Bearer {tokens['ADMIN']}"}
        admin_created_email = f"admin_created_{int(__import__('time').time())}@test.org"
        status, res = make_request(
            f"{BASE_URL}/users",
            method="POST",
            headers=headers,
            data={
                "name": "Admin-Created Secondary Admin",
                "email": admin_created_email,
                "password": "adminpass123",
                "role": "ADMIN",
                "organization": "Operations Team"
            }
        )
        if status == 201 and res.get("role") == "ADMIN":
            results.append(("Admin RBAC Allows Legitimate User Management on POST /users", "PASS", f"HTTP 201 Created user {res.get('email')} with role {res.get('role')}"))
        else:
            results.append(("Admin RBAC Allows Legitimate User Management on POST /users", "FAIL", f"Expected HTTP 201, got {status}: {res}"))
    else:
        results.append(("Admin RBAC Allows Legitimate User Management on POST /users", "FAIL", "No admin token available"))

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    run_tests()

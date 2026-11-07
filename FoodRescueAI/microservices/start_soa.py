"""
FoodRescue AI - Microservices & SOA Cluster Startup & Verification Utility.
Checks ports, validates health of Eureka Server, API Gateway, and domain services.
"""

import sys
import time
import urllib.request
import urllib.error
import json

SERVICES = [
    {"name": "Eureka Service Registry", "port": 8761, "health_url": "http://127.0.0.1:8761/actuator/health"},
    {"name": "Spring Cloud API Gateway", "port": 8080, "health_url": "http://127.0.0.1:8080/actuator/health"},
    {"name": "Food Surplus Service", "port": 8082, "health_url": "http://127.0.0.1:8082/food/health"},
    {"name": "Matching & Decision Service", "port": 8084, "health_url": "http://127.0.0.1:8084/matching/health"},
    {"name": "Logistics & Dispatch Service", "port": 8085, "health_url": "http://127.0.0.1:8085/logistics/health"},
    {"name": "FastAPI Core Backend", "port": 8000, "health_url": "http://127.0.0.1:8000/api/v1/health"},
    {"name": "React Vite Frontend", "port": 5173, "health_url": "http://127.0.0.1:5173/"},
]

def check_service(service):
    try:
        req = urllib.request.Request(service["health_url"], headers={"User-Agent": "FoodRescue-SOA-Checker"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status in [200, 204]
    except Exception:
        return False

def verify_all():
    print("=" * 60)
    print("FoodRescue AI - SOA Architecture Health Status")
    print("=" * 60)
    
    for svc in SERVICES:
        is_up = check_service(svc)
        status_text = "ONLINE [200 OK]" if is_up else "STANDBY / OFFLINE"
        print(f"• {svc['name']:<35} (Port {svc['port']}): {status_text}")
    
    print("=" * 60)

if __name__ == "__main__":
    verify_all()

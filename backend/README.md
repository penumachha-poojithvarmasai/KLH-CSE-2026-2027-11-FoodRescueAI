# FoodRescue AI — FastAPI Backend Foundation (Step 1)

This directory contains the clean **Python FastAPI Backend & Database Foundation** for **FoodRescue AI**.

---

## 🏛️ Architecture & SOA Microservice Blueprint

The backend is structured cleanly into domain routers ready for decomposition into the target SOA microservice architecture:

| Domain / Service | Port / Prefix | Responsibilities |
|---|---|---|
| **Users / Auth Service** | `/api/v1/users` | User accounts, roles (FOOD_PROVIDER, RECIPIENT, LOGISTICS_COORDINATOR, ADMIN). |
| **Food Service** | `/api/v1/food` | Surplus food intake, storage conditions, quantity, remaining usable hours. |
| **Recipient Service** | `/api/v1/recipients` | Eligible community shelters, capacity, food compatibility, need level. |
| **Matching Service** | `/api/v1/matches` | 5-Factor explainable match scores (0–100) & suitability rankings. |
| **Redistribution Service** | `/api/v1/redistributions` | 10-state redistribution lifecycle state machine & event timeline. |
| **Logistics / Pickup Service** | `/api/v1/pickups` | Dispatch coordination, driver contact telemetry, ETA monitoring. |
| **Notification Service** | `/api/v1/notifications` | Real-time system event notification alerts. |
| **Analytics & Metrics** | `/api/v1/metrics` | System impact summary (meals saved, CO₂ diverted, food waste prevented). |

---

## 💾 Real-World Ingestion Provenance (`source_url` & `source_name`)

All 7 core database models extend `BaseModelMixin`, which automatically includes:
- `source_url` (String): Source URL of scraped, ingested, or external real-world API data.
- `source_name` (String): Organization, POS, or crawler source name.

---

## ⚙️ Environment-Variable Database Configuration

The database configuration is completely decoupled and reads strictly from environment variables without hardcoded credentials:

```bash
# SQLite Default (Zero-Config out-of-the-box execution)
DATABASE_URL="sqlite:///./foodrescue.db"

# PostgreSQL / MySQL Production Overrides
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=foodrescue
# DB_PASSWORD=secret
# DB_NAME=foodrescue_db
```

---

## 🚀 Running the FastAPI Backend

### Prerequisites
- Python 3.10+ (Python 3.13 recommended)

### Setup & Launch Steps

1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate Virtual Environment**:
   - Windows PowerShell: `.\venv\Scripts\Activate.ps1`
   - Linux / macOS: `source venv/bin/activate`

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run FastAPI Server**:
   ```bash
   python run.py
   ```
   Server will start at `http://127.0.0.1:8000`.

5. **Access Interactive API Docs**:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc UI: `http://127.0.0.1:8000/redoc`

6. **Seed Initial Database**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/seed
   ```

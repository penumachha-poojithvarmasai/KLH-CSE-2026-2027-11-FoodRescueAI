# CourierProof: Smart Delivery Verification & Dispute Resolution

> A complete enterprise microservices platform built for university evaluation and hackathon jury demonstrations.

## 🚀 Quick Start Guide

### 1. Database Setup
Create MySQL schemas (default user: `root`, password: `root`):
```bash
mysql -u root -p < database/migrations/01-init-schemas.sql
mysql -u root -p < database/seed-data.sql
```
*(Or use `docker compose up -d mysql`)*

### 2. Build the Backend
Requires Java 21 and Maven 3.9+:
```bash
cd backend
mvn clean compile
```

### 3. Start Backend Services
Start in the following order:
1. `discovery-server` (`mvn spring-boot:run` in `backend/discovery-server`) — Port 8761
2. `api-gateway` (`mvn spring-boot:run` in `backend/api-gateway`) — Port 8080
3. `auth-service` (`mvn spring-boot:run` in `backend/auth-service`) — Port 8081
4. `shipment-service` (`mvn spring-boot:run` in `backend/shipment-service`) — Port 8082
5. `evidence-service` (`mvn spring-boot:run` in `backend/evidence-service`) — Port 8083
6. `dispute-service` (`mvn spring-boot:run` in `backend/dispute-service`) — Port 8084
7. `audit-service` (`mvn spring-boot:run` in `backend/audit-service`) — Port 8085
8. `notification-service` (`mvn spring-boot:run` in `backend/notification-service`) — Port 8086

### 4. Start the Frontend
Requires Node.js 20+:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 👥 Demo Accounts
All accounts use password: **`demo1234`**

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | Track shipments, search history, raise delivery disputes |
| **Courier** | `courier@demo.com` | Upload delivery photo evidence with SHA-256 hash |
| **Admin** | `admin@demo.com` | Arbitrate disputes, review notes, view audit ledger |

---

## 🏛️ Microservice Port Map
- **Eureka Service Registry**: `http://localhost:8761`
- **Spring Cloud API Gateway**: `http://localhost:8080`
- **Auth Service**: Port `8081`
- **Shipment Service**: Port `8082`
- **Evidence Service**: Port `8083`
- **Dispute Service**: Port `8084`
- **Audit Service**: Port `8085`
- **Notification Service**: Port `8086`
- **React Vite Frontend**: `http://localhost:5173`

---

## 📚 Faculty Documentation Pack
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — 5-minute timed demonstration script.
- [`docs/CO_MAPPING.md`](docs/CO_MAPPING.md) — Complete CO1 to CO4 alignment table.
- [`docs/QUESTIONS_AND_ANSWERS.md`](docs/QUESTIONS_AND_ANSWERS.md) — 25 viva questions with accurate answers.
- [`docs/ARCHITECTURE_EXPLANATION.md`](docs/ARCHITECTURE_EXPLANATION.md) — Architecture in plain English.
- [`docs/A3_POSTER.md`](docs/A3_POSTER.md) — Print-ready A3 project poster specification.
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — Common port/DB errors and solutions.


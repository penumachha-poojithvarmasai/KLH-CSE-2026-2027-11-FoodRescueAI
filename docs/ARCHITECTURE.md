# FoodRescue AI — Architecture & Service-Oriented Architecture (SOA) Integration Blueprint

## Executive Overview

FoodRescue AI is designed as an autonomous, event-driven surplus-food redistribution platform. The current version executes cleanly in-browser using a **Local Modular API Layer & Deterministic Rule-Engine Fallback**.

The architecture is strictly decoupled so that the React TypeScript frontend can interface directly with a **Spring Boot Microservices Cluster**, **Spring Cloud Gateway**, **Eureka Service Registry**, and **Google Gemini 1.5 Pro AI API** without modifying UI component code.

---

## Target Microservices Blueprint

```
                     ┌──────────────────────────────────────┐
                     │          React + TS Frontend         │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼ (HTTP / REST / WebSockets)
                     ┌──────────────────────────────────────┐
                     │        Spring Cloud Gateway          │
                     │             (Port 8080)              │
                     └──────────────────┬───────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │    Auth Service   │      │   Food Service    │      │  AI Agent Service │
   │    (Port 8081)    │      │    (Port 8082)    │      │    (Port 8083)    │
   └─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │        Eureka Service Registry       │
                     │             (Port 8761)              │
                     └──────────────────────────────────────┘
```

---

## Modular Microservice Specifications

### 1. Auth Service (Port 8081)
- **Role**: JWT Authentication, RBAC (FOOD_PROVIDER, RECIPIENT, LOGISTICS_COORDINATOR, ADMIN).
- **Database**: PostgreSQL / MySQL (`users` table).

### 2. Food Service (Port 8082)
- **Role**: Manages surplus food listings, storage conditions, Usable Time Countdown telemetry.
- **Database**: MySQL (`food_submissions`, `food_categories`).

### 3. AI Agent Service (Port 8083)
- **Role**: Executes 5-Stage Agentic Loop (**OBSERVE → ANALYZE → DECIDE → ACT → MONITOR**).
- **Integrations**: Google Gemini 1.5 Pro API + RuleEngineFallback.

### 4. Matching Service (Port 8084)
- **Role**: Computes 5-Factor Deterministic Match Score (0 - 100) between food listings and recipient shelters.
- **Engine**: Category Compatibility (25%), Recipient Need (25%), Capacity (20%), Distance (15%), Availability (15%).

### 5. Redistribution & Logistics Service (Port 8085)
- **Role**: Manages 10-state redistribution pipeline state machine and pickup driver telemetry.

---

## AI Service Abstraction (`IAIService`)

The application consumes AI intelligence through a clean interface abstraction:

```typescript
export interface IAIService {
  analyzeFoodSubmission(submission: Partial<FoodSubmission>): Promise<AIAnalysis>;
  getEngineName(): string;
}
```

If the external Gemini API is unreachable or omitted, the application seamlessly defaults to `RuleEngineFallback`, ensuring zero downtime and 100% operational reliability out of the box.

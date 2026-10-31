# FoodRescue AI: Autonomous Surplus-Food Detection & Redistribution Agent

> **An AI-powered autonomous platform connecting food providers with eligible recipient organizations to eliminate edible food waste and combat food insecurity.**

---

## 🌟 Project Title
**FoodRescue AI: Autonomous Surplus-Food Detection & Redistribution Agent**

---

## 📌 Problem Statement

Large quantities of edible, safe food are wasted daily by college canteens, restaurants, hotels, cafeterias, and event venues. At the same time, local community shelters, orphanages, food banks, and NGOs face critical food shortages. 

Traditional donation systems rely on manual reporting, phone calls, and uncoordinated logistics. The core challenge is not simply "reporting food" — it requires intelligent, automated decisions:
- What food is available and in what volume?
- How perishable is the food and what is its remaining usable time window?
- Which recipient organization is best suited to receive it right now?
- How can logistics pickup and delivery be coordinated autonomously?

FoodRescue AI solves this challenge by operating as an **Autonomous AI Agent**.

---

## 🚀 Three Core Novelties

1. **AI-Based Surplus Food Intelligence**: Automatically computes perishability levels, usable time countdowns (hours), storage requirements, and priority scores (0–100) from intake metrics.
2. **Context-Aware Recipient Matching**: Employs a 5-factor explainable scoring engine evaluating Category Compatibility (25%), Recipient Need (25%), Capacity Match (20%), Proximity / Distance (15%), and Availability Window (15%).
3. **Autonomous Redistribution Coordination**: Progresses continuously from food submission to recipient selection, real-time alert dispatching, pickup coordination, and logistics telemetry monitoring with minimal manual friction.

---

## 🤖 Main Agentic Workflow

The core architecture follows a 5-stage visual and interactive agent lifecycle:

```
  ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐
  │  OBSERVE  │ ───► │  ANALYZE  │ ───► │  DECIDE   │ ───► │    ACT    │ ───► │  MONITOR  │
  └───────────┘      └───────────┘      └───────────┘      └───────────┘      └───────────┘
```

- **OBSERVE**: Detects and ingests surplus food listings from providers.
- **ANALYZE**: Evaluates food category, volume, storage conditions, usable window, and urgency level.
- **DECIDE**: Calculates deterministic match scores across recipient candidates and selects the optimal match.
- **ACT**: Dispatches redistribution requests and triggers real-time notification alerts.
- **MONITOR**: Tracks logistics pickup vehicles, driver telemetry, ETA, and successful delivery handoffs.

---

## 💻 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Recharts.
- **Architecture**: Component-based modular architecture, React Context state management, custom glassmorphism styling.
- **Service Layer**: Decoupled interface abstractions (`IAIService`, `MatchingEngine`, `RedistributionService`) executing 100% locally with zero external API keys required.

---

## 🏛️ SOA & Microservices Integration Blueprint

FoodRescue AI is built ready for future enterprise cloud integration:

```
React Frontend ──► Spring Cloud Gateway (8080) ──► Eureka Registry (8761) ──► Spring Boot Microservices
```

- **Auth Service** (Port 8081): JWT & RBAC.
- **Food Service** (Port 8082): Surplus food cataloging.
- **AI Agent Service** (Port 8083): Google Gemini 1.5 Pro integration with local RuleEngineFallback.
- **Matching Service** (Port 8084): 5-factor matching engine.
- **Logistics Service** (Port 8085): Driver telemetry & delivery status machine.

---

## 🌍 UN SDG Alignment

- **SDG 2 — Zero Hunger** (Target 2.1): Redirecting edible meals to community shelters and food banks.
- **SDG 12 — Responsible Consumption & Production** (Target 12.3): Halving commercial food waste and reducing methane emissions from landfills.

---

## 🔧 Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps

1. **Clone or Navigate to Project Directory**:
   ```bash
   cd "FoodRescue AI"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🧪 Verification & Demonstration

1. **Simulate Agent Loop**: Open the **AI Agent Command Center** and click **"Simulate Full Agent Loop"** to observe live state transitions across all 5 lifecycle stages.
2. **Food Intake Presets**: Open **Food Submissions**, click quick preset **"HOT MEAL"**, and observe the real-time usable hours & urgency calculator.
3. **5-Factor Matching**: Open **Recipient Matching** to view explainable score breakdowns (0–100) for recipient candidates.
4. **Role Switching**: Use the header dropdown to switch between **Food Provider**, **Recipient NGO**, **Logistics Coordinator**, and **System Admin** views.

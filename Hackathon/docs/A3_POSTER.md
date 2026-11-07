# COURIERPROOF — A3 POSTER SPECIFICATION
## Smart Delivery Verification & Dispute Resolution Using SOA & Microservices

---

### [SECTION 1: HEADER & IDENTITY]
- **Project Title**: COURIERPROOF
- **Subtitle**: Enterprise Delivery Evidence Verification & Dispute Arbitration Platform
- **Course**: Service-Oriented Architecture (SOA) & Microservices
- **Stack**: Java 21 | Spring Boot 3.2 | Spring Cloud | React 19 | TypeScript | Vite | Tailwind CSS | MySQL 8.0

---

### [SECTION 2: PROBLEM STATEMENT & MOTIVATION]
- E-commerce logistics face frequent "Package Not Received" claims despite carriers marking parcels as "DELIVERED".
- Monolithic architectures lack transparent multi-party arbitration, cross-service auditability, and tamper-proof evidence verification.
- CourierProof replaces legacy monolithic tracking with autonomous microservices, cryptographic photo hashing (SHA-256), and verifiable dispute workflows.

---

### [SECTION 3: SYSTEM ARCHITECTURE & TOPOLOGY]
```
[React 19 Frontend (:5173)] ──► [Spring Cloud Gateway (:8080)] ──► [Eureka Discovery (:8761)]
                                         │
        ┌───────────────┬────────────────┼───────────────┬───────────────┐
        ▼               ▼                ▼               ▼               ▼
 [Auth Service]  [Shipment Svc]   [Evidence Svc]  [Dispute Svc]   [Audit Svc]
     (:8081)         (:8082)          (:8083)         (:8084)         (:8085)
        │               │                │               │               │
  auth_db (MySQL)  ship_db (MySQL)  evid_db (MySQL) disp_db (MySQL) audit_db (MySQL)
```

---

### [SECTION 4: KEY CAPABILITIES & INNOVATION]
1. **Cryptographic Proof of Delivery**: Raw delivery photos are hashed with SHA-256 upon courier upload to guarantee immutability.
2. **Orchestrated Dispute Arbitration**: Dispute Service coordinates shipment verification, customer claims, and admin resolution with permanent justification.
3. **Strict Database-per-Service**: 6 autonomous MySQL schemas prevent database coupling.
4. **Stateless JWT Security**: Role-based access control protecting Customer, Courier, and Admin boundaries.

---

### [SECTION 5: COURSE OUTCOME (CO) MAPPING]
- **CO1 (SOA & Governance)**: 8 decoupled modules, Orchestration pattern, REST vs SOAP analysis, Agile user stories.
- **CO2 (Security & Observability)**: Spring Security, JWT HMAC SHA-256, BCrypt, RBAC, Gateway CORS, SHA-256 evidence hashing.
- **CO3 (Discovery & Gateway)**: Netflix Eureka, Spring Cloud Gateway with Correlation IDs, Database-per-Service with JPA.
- **CO4 (Testing & CI/CD)**: JUnit 5, Mockito unit tests, full reactor build, GitHub Actions automated CI/CD pipeline.

---

### [SECTION 6: PRINTING INSTRUCTIONS]
- **Paper Size**: A3 Landscape (420mm × 297mm)
- **Margins**: 10mm
- **Color Profile**: CMYK (Deep Navy #0f172a, Royal Blue #2563eb, Emerald #059669)


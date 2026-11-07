# Course Outcome (CO) Mapping Specification

| CO Code | Topic / Concept | Implementation Location | Practical Evidence & Verification | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CO1** | SOA Principles (Loose Coupling, Autonomy) | `backend/*` | 8 independent modules, individual pom.xml & ports | **Implemented** |
| **CO1** | Orchestration & Choreography | `DisputeService.java` | Coordinates cross-service validation with Shipment, Audit, and Notification | **Implemented** |
| **CO1** | REST vs SOAP | `docs/PROJECT_REPORT.md` & UI | Comparison matrix of XML/WSDL vs JSON endpoints | **Implemented** |
| **CO1** | Agile Practices & User Stories | `docs/USER_STORIES_AND_SPRINT.md` & UI | US-01 through US-06 with points and acceptance criteria | **Implemented** |
| **CO2** | Spring Security & JWT | `auth-service` & `JwtAuthFilter` | Bearer token validation, stateless session, claims parsing | **Implemented** |
| **CO2** | Role-Based Access Control (RBAC) | `SecurityConfig.java` in services | Strict CUSTOMER, COURIER, ADMIN role gates; 403 on violations | **Implemented** |
| **CO2** | Cryptographic Delivery Integrity | `EvidenceService.java` | SHA-256 evidence hashing prevents tampered photos | **Implemented** |
| **CO2** | CORS & Header Injection | `api-gateway` | Global CORS policy & `X-Correlation-ID` header filter | **Implemented** |
| **CO3** | Service Discovery | `discovery-server` (:8761) | Netflix Eureka Server with autonomous client heartbeats | **Implemented** |
| **CO3** | API Gateway Routing | `api-gateway` (:8080) | Path-based dynamic forwarding to registered services | **Implemented** |
| **CO3** | Database-per-Service Pattern | `database/migrations` | 6 separate MySQL databases, zero cross-service SQL joins | **Implemented** |
| **CO3** | Spring Data JPA | `backend/*/repository` | Entity lifecycle management, transactional status history | **Implemented** |
| **CO4** | Unit Testing (JUnit 5 + Mockito) | `ShipmentServiceTest.java` | Business logic testing of status transitions and role checks | **Implemented** |
| **CO4** | Integration Testing & Build | Maven multi-module reactor | Full compile passes on Java 21 across all 9 modules | **Implemented** |
| **CO4** | CI/CD Automation | `.github/workflows/ci.yml` | Multi-step GitHub Actions automated build & test pipeline | **Implemented** |
| **CO4** | Contract Specification | `docs/API_DOCUMENTATION.md` | Documented OpenAPI/REST endpoints and JSON contracts | **Implemented** |


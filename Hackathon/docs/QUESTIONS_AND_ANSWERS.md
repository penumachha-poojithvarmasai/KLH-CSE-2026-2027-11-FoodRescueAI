# 25 Faculty Viva Questions & Answers

**Q1: What is the core difference between SOA and Microservices in your project?**
A: SOA is an architectural style focused on service reusability, loose coupling, and standardized contracts. Microservices is an evolution of SOA that emphasizes finer-grained bounded contexts, strict Database-per-Service ownership, and independent containerized deployments.

**Q2: What is the purpose of the API Gateway?**
A: It acts as the single reverse proxy entry point (Port 8080) for all client traffic. It manages CORS policies, injects `X-Correlation-ID` headers for request tracing, and routes traffic dynamically using Eureka.

**Q3: How does Eureka Service Discovery work?**
A: Services register their host, port, and health check with Eureka on startup. The API Gateway queries Eureka using logical service names (e.g., `lb://DISPUTE-SERVICE`) so hardcoded IP addresses are avoided.

**Q4: How did you implement Orchestration in CourierProof?**
A: The Dispute Service acts as the central orchestrator when a customer raises a dispute: it queries Shipment Service to validate the tracking code, saves the dispute, calls Audit Service to write an immutable event, and triggers Notification Service.

**Q5: What is the Database-per-Service pattern and why did you use it?**
A: Each service owns its own database (`courierproof_auth`, `courierproof_shipments`, etc.). Direct cross-service SQL joins are prohibited. This prevents database-level coupling so one service schema change never breaks another service.

**Q6: How does JWT authentication work in your architecture?**
A: When a user logs in, Auth Service issues an HMAC SHA-256 signed JWT containing `userId`, `email`, and `role`. Clients send this token in the `Authorization: Bearer <token>` header. Each microservice's `JwtAuthFilter` extracts and validates the token statelessly without needing a centralized session database.

**Q7: How do you prevent couriers from uploading fake or altered delivery photos?**
A: The Evidence Service calculates a cryptographic SHA-256 hash across the raw byte array of the uploaded image. Any subsequent change to the photo produces a mismatched hash, guaranteeing tamper detection.

**Q8: What happens if a Customer tries to resolve an admin dispute?**
A: The Dispute Service checks `@EnableMethodSecurity` and the extracted JWT role. If the caller does not have `ROLE_ADMIN`, Spring Security immediately returns a `403 Forbidden` response.

**Q9: Why use REST instead of SOAP?**
A: REST uses lightweight JSON over HTTP, making it fast and easy to consume for our React web client. SOAP uses rigid XML envelopes with WSDL contracts, which introduces unnecessary payload size and parsing overhead for modern web apps.

**Q10: Where is BCrypt used in the project?**
A: In `auth-service`, BCrypt hashes user passwords with 10 salt rounds before storing them in MySQL. Plaintext passwords are never saved.

**Q11: How do you trace a request across multiple microservices?**
A: The API Gateway's `CorrelationIdFilter` assigns a unique `X-Correlation-ID` header to every incoming HTTP request. This ID is passed to downstream services and recorded in `AuditRecord`.

**Q12: What unit tests did you write?**
A: We used JUnit 5 and Mockito in `ShipmentServiceTest.java` to test business logic such as admin vs. customer shipment filtering, status transitions, and empty search exceptions.

**Q13: How does your CI/CD pipeline work?**
A: GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request. It compiles all 9 Maven backend modules with JDK 21, executes unit tests, and validates the Vite React build.

**Q14: What is CORS and how did you configure it?**
A: Cross-Origin Resource Sharing is a browser security measure that restricts cross-origin HTTP requests. In `GatewayConfig.java`, we allow the frontend origin `http://localhost:5173` with GET, POST, PUT, DELETE, and OPTIONS methods.

**Q15: How do microservices communicate with each other?**
A: They communicate via synchronous REST API calls using Spring's `RestTemplate`.

**Q16: How does the application handle service failures?**
A: Cross-service calls in `DisputeService` use try-catch fallback handling so that an outage in the non-critical Notification or Audit service will not crash the core dispute submission.

**Q17: What is Spring Cloud Gateway?**
A: A non-blocking, reactive reverse proxy built on Project Reactor and Netty, providing intelligent routing and security filter chains.

**Q18: What is Spring Data JPA?**
A: An abstraction layer on top of Hibernate that reduces boilerplate data access code using declarative repository interfaces (`JpaRepository`).

**Q19: How did you implement Agile practices?**
A: We defined prioritized user stories (US-01 through US-06) with story points, acceptance criteria, and a visible Kanban board in the frontend.

**Q20: What are the primary user roles in CourierProof?**
A: `CUSTOMER` (tracks and disputes), `COURIER` (updates delivery and uploads evidence), and `ADMIN` (investigates and resolves claims).

**Q21: How do you prevent SQL Injection?**
A: Spring Data JPA uses parameterized prepared statements under the hood, completely preventing raw SQL string concatenation.

**Q22: Why is the Discovery Server started before other services?**
A: Other microservices need Eureka running so they can register their network location upon startup.

**Q23: What is the advantage of multi-module Maven?**
A: The root `pom.xml` manages shared dependency versions (Spring Boot 3.2.5, Spring Cloud 2023.0.1, JJWT) in one place and compiles all modules with a single command.

**Q24: How does CourierProof map to CO1?**
A: It demonstrates SOA principles (loose coupling, contracts, discovery), orchestration in DisputeService, REST vs. SOAP analysis, and Agile sprint planning.

**Q25: How does CourierProof map to CO3?**
A: It implements Eureka discovery, API Gateway routing, and the Database-per-Service pattern with Spring Data JPA.


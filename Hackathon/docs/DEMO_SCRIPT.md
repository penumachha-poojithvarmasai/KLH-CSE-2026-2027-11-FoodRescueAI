# CourierProof 5-Minute Faculty Presentation Script

**Minute 0:00 - 0:45: The Problem & Solution**
"Good afternoon, respected evaluators. E-commerce delivery disputes are a huge issue: packages marked delivered without proof, damaged goods, or false non-receipt claims. We built CourierProof — a smart delivery verification and dispute resolution platform engineered using Service-Oriented Architecture (SOA) and Spring Boot microservices."

**Minute 0:45 - 1:30: The Architecture**
"Instead of a monolithic backend, CourierProof uses an autonomous microservices architecture. Our React 19 frontend communicates solely through a Spring Cloud API Gateway on Port 8080. The Gateway discovers our 6 backend services dynamically via Netflix Eureka on Port 8761. Furthermore, we follow the strict Database-per-Service pattern with 6 isolated MySQL databases."

**Minute 1:30 - 2:30: Live Demonstration (Courier Evidence Upload)**
"Let's demonstrate the workflow. First, our courier logs in. When they deliver package CP-2024-001, they upload a photo. Notice what happens: our Evidence Service processes the image and calculates a SHA-256 cryptographic checksum. This guarantees tamper-proof evidence."

**Minute 2:30 - 3:30: Live Customer Dispute & Orchestration**
"Now, the customer checks tracking, notices an issue, and raises a dispute: 'Package Not Received'. Here, CO1 Orchestration takes place: Dispute Service queries Shipment Service over REST to confirm package validity, saves the dispute in its own database, logs an event to the Audit Service, and dispatches a notification."

**Minute 3:30 - 4:15: Admin Arbitration & Security**
"Next, the administrator opens the Dispute Investigation Center, reviews the courier's GPS location and photo hash, adds investigation notes, and records a permanent decision. Notice that if a customer attempts to call this resolution endpoint, our Spring Security filter chain rejects it with 403 Forbidden. Role-Based Access Control is enforced on the server."

**Minute 4:15 - 5:00: Course Outcomes & Conclusion**
"Every requirement from CO1 to CO4 is satisfied:
- CO1: SOA principles, orchestration, and Agile backlog.
- CO2: JWT stateless authentication, RBAC, and SHA-256 hashing.
- CO3: Eureka discovery, Gateway routing, and Database-per-Service.
- CO4: JUnit 5 unit tests, Maven multi-module builds, and GitHub Actions CI/CD.
Thank you! We welcome your questions."


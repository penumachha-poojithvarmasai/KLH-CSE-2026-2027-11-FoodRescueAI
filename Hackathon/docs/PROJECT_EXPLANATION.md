# CourierProof: Simple Project Summary

## What is CourierProof?
CourierProof is a smart delivery verification and dispute resolution platform designed for e-commerce logistics.

## The Core Problem It Solves
Sometimes a customer orders a parcel, the delivery app marks it "DELIVERED", but the customer never received anything. When the customer complains, the courier claims they dropped it off. CourierProof resolves this dispute transparently:
1. Couriers upload photo proof of delivery which gets hashed with SHA-256 (so it cannot be altered later).
2. Customers can file disputes for unreceived or damaged packages.
3. Customer service administrators examine the evidence, notes, and timeline, then resolve or reject the dispute with a permanent reason.
4. Every single action is written to an immutable audit ledger.

## The Architecture in Simple English
- **React Frontend**: The polished web interface the user sees.
- **API Gateway (Port 8080)**: The single front door that routes incoming requests to the right service.
- **Eureka Server (Port 8761)**: The address book where microservices register their IP and port.
- **Auth Service (Port 8081)**: Manages login, users, and JWT identity badges.
- **Shipment Service (Port 8082)**: Keeps track of packages, locations, and delivery statuses.
- **Evidence Service (Port 8083)**: Stores delivery photos and computes tamper-proof SHA-256 hashes.
- **Dispute Service (Port 8084)**: Coordinates disputes and records admin decisions.
- **Audit Service (Port 8085)**: A chronological diary of every action taken in the system.
- **Notification Service (Port 8086)**: Alerts users when dispute status changes.


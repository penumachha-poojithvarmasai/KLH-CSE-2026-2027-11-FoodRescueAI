# Database Management & Schema Isolation

CourierProof strictly follows the **Database-Per-Service** pattern to maintain microservice decoupling and autonomy.

## Autonomous Schemas:
1. `courierproof_auth`: Stores users, BCrypt password hashes, and user roles (CUSTOMER, COURIER, ADMIN).
2. `courierproof_shipments`: Manages package lifecycle, dispatch origin/destinations, recipient information, and history checkpoints.
3. `courierproof_evidence`: Stores delivery proof-of-delivery records, file paths, and cryptographic SHA-256 hashes.
4. `courierproof_disputes`: Encapsulates dispute arbitration cases, customer claims, investigation notes, and decisions.
5. `courierproof_audit`: Chronological event audit log, tracking correlation IDs and system events.
6. `courierproof_notifications`: Internal notification dispatch records.

## Initialization & Seeding:
- Schemas are generated automatically via Spring Data JPA `ddl-auto: update`.
- To pre-initialize on clean MySQL instances:
  ```bash
  mysql -u root -p < database/migrations/01-init-schemas.sql
  mysql -u root -p < database/seed-data.sql
  ```


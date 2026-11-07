# Agile User Stories & Sprint Plan

## Sprint Goal
Deliver an end-to-end verified delivery and dispute arbitration microservice platform for hackathon demonstration.

## Prioritized User Stories

### US-01: Shipment Tracking
- **As a** Customer,
- **I want to** track my shipment using its tracking code,
- **So that** I know where my parcel is in the delivery lifecycle.
- **Acceptance Criteria**:
  - `GET /api/shipments/track/{trackingId}` returns shipment details and history checkpoints.
  - History entries contain timestamp, status, and responsible actor.
- **Points**: 3

### US-02: Cryptographic Proof Upload
- **As a** Courier,
- **I want to** upload a delivery photo and recipient confirmation,
- **So that** the delivery is verified with indisputable evidence.
- **Acceptance Criteria**:
  - `POST /api/evidence/upload` accepts image file and metadata.
  - Calculates SHA-256 hash automatically and saves record.
- **Points**: 5

### US-03: Raise Dispute
- **As a** Customer,
- **I want to** raise a dispute for a package marked delivered that I did not receive,
- **So that** customer support can investigate.
- **Acceptance Criteria**:
  - `POST /api/disputes` verifies tracking code existence.
  - Generates unique reference code `DISP-YYYY-XXX` and records in dispute database.
- **Points**: 5

### US-04: Admin Arbitration
- **As an** Administrator,
- **I want to** review evidence and resolve or reject a dispute with mandatory reasoning,
- **So that** arbitration decisions are clear and documented.
- **Acceptance Criteria**:
  - `PUT /api/disputes/{id}/resolve` and `/reject` update status and record resolution text.
- **Points**: 8

### US-05: Cross-Service Audit Log
- **As an** Auditor,
- **I want** an immutable log of all dispute actions and status changes,
- **So that** system accountability is guaranteed.
- **Acceptance Criteria**:
  - System operations append records to `courierproof_audit` with correlation IDs.
- **Points**: 3

### US-06: Endpoint Security
- **As a** Security Engineer,
- **I want** role-based JWT protection on sensitive endpoints,
- **So that** unauthorized users cannot resolve disputes or alter records.
- **Acceptance Criteria**:
  - Requests without valid token return `401 Unauthorized`.
  - Customer trying to resolve disputes returns `403 Forbidden`.
- **Points**: 5


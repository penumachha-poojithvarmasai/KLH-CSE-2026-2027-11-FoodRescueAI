# CourierProof API Specification (OpenAPI / REST)

All client requests should be routed through the API Gateway at `http://localhost:8080`.

## 1. Authentication Service (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email/password. Returns JWT bearer token, userId, and role.
- `POST /api/auth/register`: Create a new user profile.
- `GET /api/auth/me`: Get profile of authenticated user.

## 2. Shipment Service (`/api/shipments`)
- `GET /api/shipments/track/{trackingId}`: Public tracking endpoint returning shipment info and historical checkpoints.
- `GET /api/shipments`: Filtered list of shipments based on user role.
- `PUT /api/shipments/{id}/status`: Update shipment status (`IN_TRANSIT`, `DELIVERED`, etc.).
- `GET /api/shipments/dashboard/stats`: Returns telemetry statistics for dashboard.

## 3. Evidence Service (`/api/evidence`)
- `POST /api/evidence/upload` (`multipart/form-data`): Upload delivery photo, calculates SHA-256 hash, saves receiver info and GPS coordinates.
- `GET /api/evidence/shipment/{shipmentId}`: Retrieve evidence associated with a package.
- `GET /api/evidence/uploads/{filename}`: Serve stored image binary.

## 4. Dispute Service (`/api/disputes`)
- `POST /api/disputes`: Raise delivery dispute. Validates tracking existence against Shipment Service.
- `GET /api/disputes`: List open/resolved disputes.
- `GET /api/disputes/{id}`: Dispute detail including chronological investigation notes.
- `PUT /api/disputes/{id}/resolve`: Admin marks dispute resolved with mandatory justification.
- `PUT /api/disputes/{id}/reject`: Admin rejects dispute claim.
- `POST /api/disputes/{id}/notes`: Add investigation observation note.

## 5. Audit Service (`/api/audit`)
- `POST /api/audit/events`: Internal service endpoint to append immutable audit records.
- `GET /api/audit/events/recent`: Retrieve recent 20 audit stream events.

## 6. Notification Service (`/api/notifications`)
- `POST /api/notifications`: Append alert notification.
- `GET /api/notifications/user/{userId}`: Retrieve notification feed for specific user.


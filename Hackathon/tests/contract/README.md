# Contract & OpenAPI Verification

Service contracts define the standardized REST communication interfaces between services.
- `GET /api/shipments/track/{trackingId}` -> returns `ShipmentTrackingResponse`
- `POST /api/disputes` -> accepts `CreateDisputeRequest`
- `POST /api/audit/events` -> accepts `AuditEventRequest`

See `docs/API_DOCUMENTATION.md` for full schemas.


# CourierProof Architecture: Plain English Guide

```
[Browser / Mobile UI]
         │ (HTTP / JSON with JWT Badge)
         ▼
[Spring Cloud API Gateway :8080] ─── queries ───► [Eureka Discovery :8761]
         │
         ├──► /api/auth/**         ──► [Auth Service :8081]
         ├──► /api/shipments/**    ──► [Shipment Service :8082]
         ├──► /api/evidence/**     ──► [Evidence Service :8083]
         ├──► /api/disputes/**     ──► [Dispute Service :8084] (Orchestrator)
         ├──► /api/audit/**        ──► [Audit Service :8085]
         └──► /api/notifications/**──► [Notification Service :8086]
```

## Why Microservices Instead of One Big App?
1. **Fault Isolation**: If the evidence photo upload service crashes, customers can still track their shipments.
2. **Independent Scaling**: If millions of customers are tracking parcels during a holiday sale, only the Shipment Service needs more CPU/RAM.
3. **Database Independence**: Each service owns its own database table. Dispute Service cannot mess up the Shipment database directly.


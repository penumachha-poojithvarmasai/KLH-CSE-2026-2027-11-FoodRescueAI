package com.courierproof.auditservice.dto;

import lombok.Data;

@Data
public class AuditEventRequest {
    private String correlationId;
    private String eventType;
    private String entityType;
    private Long entityId;
    private String actorEmail;
    private String actorRole;
    private String description;
    private String metadata;
}


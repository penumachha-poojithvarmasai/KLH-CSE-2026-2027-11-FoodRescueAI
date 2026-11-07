package com.courierproof.auditservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String correlationId;
    private String eventType;
    private String entityType;
    private Long entityId;
    private String actorEmail;
    private String actorRole;
    
    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String metadata;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}


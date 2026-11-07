package com.courierproof.auditservice.service;

import com.courierproof.auditservice.dto.AuditEventRequest;
import com.courierproof.auditservice.entity.AuditRecord;
import com.courierproof.auditservice.repository.AuditRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRecordRepository auditRecordRepository;

    public AuditRecord recordEvent(AuditEventRequest request) {
        AuditRecord record = AuditRecord.builder()
                .correlationId(request.getCorrelationId() != null ? request.getCorrelationId() : UUID.randomUUID().toString())
                .eventType(request.getEventType())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .actorEmail(request.getActorEmail())
                .actorRole(request.getActorRole())
                .description(request.getDescription())
                .metadata(request.getMetadata())
                .timestamp(LocalDateTime.now())
                .build();
        return auditRecordRepository.save(record);
    }

    public List<AuditRecord> getAllEvents() {
        return auditRecordRepository.findAll();
    }

    public List<AuditRecord> getEntityAudit(String entityType, Long entityId) {
        return auditRecordRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public List<AuditRecord> getRecentEvents() {
        return auditRecordRepository.findTop20ByOrderByTimestampDesc();
    }
}


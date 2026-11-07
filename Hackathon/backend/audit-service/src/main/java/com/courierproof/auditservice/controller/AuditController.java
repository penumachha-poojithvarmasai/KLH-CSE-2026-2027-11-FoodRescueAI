package com.courierproof.auditservice.controller;

import com.courierproof.auditservice.dto.AuditEventRequest;
import com.courierproof.auditservice.entity.AuditRecord;
import com.courierproof.auditservice.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
// CORS managed centrally by Gateway
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping("/events")
    public ResponseEntity<AuditRecord> recordEvent(@RequestBody AuditEventRequest request) {
        return ResponseEntity.status(201).body(auditService.recordEvent(request));
    }

    @GetMapping("/events")
    public ResponseEntity<List<AuditRecord>> getAllEvents() {
        return ResponseEntity.ok(auditService.getAllEvents());
    }

    @GetMapping("/events/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditRecord>> getEntityAudit(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditService.getEntityAudit(entityType, entityId));
    }

    @GetMapping("/events/recent")
    public ResponseEntity<List<AuditRecord>> getRecentEvents() {
        return ResponseEntity.ok(auditService.getRecentEvents());
    }
}


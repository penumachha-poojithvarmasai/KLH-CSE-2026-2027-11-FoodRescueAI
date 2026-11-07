package com.courierproof.disputeservice.service;

import com.courierproof.disputeservice.dto.*;
import com.courierproof.disputeservice.entity.Dispute;
import com.courierproof.disputeservice.entity.DisputeNote;
import com.courierproof.disputeservice.repository.DisputeNoteRepository;
import com.courierproof.disputeservice.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeNoteRepository noteRepository;
    private final RestTemplate restTemplate;

    @Value("${shipment.service.url:http://localhost:8082}")
    private String shipmentServiceUrl;

    @Value("${audit.service.url:http://localhost:8085}")
    private String auditServiceUrl;

    @Value("${notification.service.url:http://localhost:8086}")
    private String notificationServiceUrl;

    @Transactional
    public Dispute createDispute(CreateDisputeRequest request, Long customerId, String customerEmail) {
        // Validate shipment exists via Shipment Service (orchestration)
        Long shipmentId = validateShipment(request.getTrackingId());

        // Generate dispute reference
        long count = disputeRepository.count() + 1;
        String disputeRef = String.format("DISP-%d-%03d", java.time.Year.now().getValue(), count);

        Dispute dispute = Dispute.builder()
                .disputeRef(disputeRef)
                .shipmentId(shipmentId)
                .trackingId(request.getTrackingId())
                .customerId(customerId)
                .reason(request.getReason())
                .description(request.getDescription())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        dispute = disputeRepository.save(dispute);
        final Long disputeId = dispute.getId();
        final String disputeRefFinal = dispute.getDisputeRef();

        // Record audit event (fire-and-forget)
        try {
            restTemplate.postForObject(auditServiceUrl + "/api/audit/events",
                Map.of(
                    "eventType", "DISPUTE_CREATED",
                    "entityType", "DISPUTE",
                    "entityId", disputeId,
                    "actorEmail", customerEmail,
                    "actorRole", "CUSTOMER",
                    "description", "Dispute created: " + disputeRefFinal
                ), Object.class);
        } catch (Exception e) {
            log.warn("Audit service unavailable: {}", e.getMessage());
        }

        // Send notification (fire-and-forget)
        try {
            restTemplate.postForObject(notificationServiceUrl + "/api/notifications",
                Map.of(
                    "userId", customerId,
                    "email", customerEmail,
                    "type", "DISPUTE_CREATED",
                    "title", "Dispute Raised",
                    "message", "Your dispute " + disputeRefFinal + " has been submitted."
                ), Object.class);
        } catch (Exception e) {
            log.warn("Notification service unavailable: {}", e.getMessage());
        }

        return dispute;
    }

    public List<Dispute> getAllDisputes(String role, Long userId) {
        if ("ADMIN".equals(role)) {
            return disputeRepository.findAll();
        }
        return disputeRepository.findByCustomerId(userId);
    }

    public DisputeDetailResponse getDisputeById(Long id) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
        List<DisputeNote> notes = noteRepository.findByDisputeIdOrderByAddedAtAsc(id);
        return new DisputeDetailResponse(dispute, notes);
    }

    @Transactional
    public Dispute setUnderReview(Long id, String adminEmail) {
        Dispute dispute = findById(id);
        dispute.setStatus("UNDER_REVIEW");
        dispute.setUpdatedAt(LocalDateTime.now());
        dispute = disputeRepository.save(dispute);
        addNoteInternal(id, "Dispute set to Under Review", adminEmail, "ADMIN");
        sendAuditEvent("DISPUTE_UNDER_REVIEW", "DISPUTE", id, adminEmail, "ADMIN",
                "Dispute under review: " + dispute.getDisputeRef());
        return dispute;
    }

    @Transactional
    public Dispute resolveDispute(Long id, String resolution, Long adminId, String adminEmail) {
        Dispute dispute = findById(id);
        dispute.setStatus("RESOLVED");
        dispute.setResolution(resolution);
        dispute.setResolvedByAdminId(adminId);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setUpdatedAt(LocalDateTime.now());
        dispute = disputeRepository.save(dispute);
        addNoteInternal(id, "RESOLVED: " + resolution, adminEmail, "ADMIN");
        sendAuditEvent("DISPUTE_RESOLVED", "DISPUTE", id, adminEmail, "ADMIN",
                "Dispute resolved: " + dispute.getDisputeRef());
        return dispute;
    }

    @Transactional
    public Dispute rejectDispute(Long id, String reason, Long adminId, String adminEmail) {
        Dispute dispute = findById(id);
        dispute.setStatus("REJECTED");
        dispute.setResolution(reason);
        dispute.setResolvedByAdminId(adminId);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setUpdatedAt(LocalDateTime.now());
        dispute = disputeRepository.save(dispute);
        addNoteInternal(id, "REJECTED: " + reason, adminEmail, "ADMIN");
        sendAuditEvent("DISPUTE_REJECTED", "DISPUTE", id, adminEmail, "ADMIN",
                "Dispute rejected: " + dispute.getDisputeRef());
        return dispute;
    }

    public DisputeNote addNote(Long id, String note, String addedBy, String role) {
        return addNoteInternal(id, note, addedBy, role);
    }

    public DisputeStats getStats() {
        long open = disputeRepository.countByStatus("OPEN");
        long underReview = disputeRepository.countByStatus("UNDER_REVIEW");
        long resolved = disputeRepository.countByStatus("RESOLVED");
        long rejected = disputeRepository.countByStatus("REJECTED");
        return new DisputeStats(open, underReview, resolved, rejected, open + underReview + resolved + rejected);
    }

    private Dispute findById(Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
    }

    private DisputeNote addNoteInternal(Long disputeId, String note, String addedBy, String role) {
        DisputeNote dn = DisputeNote.builder()
                .disputeId(disputeId)
                .note(note)
                .addedBy(addedBy)
                .addedByRole(role)
                .addedAt(LocalDateTime.now())
                .build();
        return noteRepository.save(dn);
    }

    private Long validateShipment(String trackingId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    shipmentServiceUrl + "/api/shipments/track/" + trackingId, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> shipment = (Map<?, ?>) response.getBody().get("shipment");
                if (shipment != null) {
                    Object idObj = shipment.get("id");
                    if (idObj instanceof Integer) return ((Integer) idObj).longValue();
                    return (Long) idObj;
                }
            }
        } catch (Exception e) {
            log.warn("Shipment service unavailable, proceeding: {}", e.getMessage());
        }
        return null; // Allow dispute creation even if shipment service is down
    }

    private void sendAuditEvent(String eventType, String entityType, Long entityId,
                                String actorEmail, String actorRole, String description) {
        try {
            restTemplate.postForObject(auditServiceUrl + "/api/audit/events",
                Map.of("eventType", eventType, "entityType", entityType, "entityId", entityId,
                       "actorEmail", actorEmail, "actorRole", actorRole, "description", description),
                Object.class);
        } catch (Exception e) {
            log.warn("Audit event failed: {}", e.getMessage());
        }
    }
}


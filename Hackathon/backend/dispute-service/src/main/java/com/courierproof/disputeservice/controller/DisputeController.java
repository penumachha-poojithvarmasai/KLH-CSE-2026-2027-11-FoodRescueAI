package com.courierproof.disputeservice.controller;

import com.courierproof.disputeservice.dto.*;
import com.courierproof.disputeservice.entity.Dispute;
import com.courierproof.disputeservice.entity.DisputeNote;
import com.courierproof.disputeservice.service.DisputeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disputes")
// CORS managed centrally by Gateway
public class DisputeController {

    private final DisputeService disputeService;

    public DisputeController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @PostMapping
    public ResponseEntity<Dispute> createDispute(
            @Valid @RequestBody CreateDisputeRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        String email = (String) httpRequest.getAttribute("userEmail");
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"CUSTOMER".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        Dispute dispute = disputeService.createDispute(request, userId, email);
        return ResponseEntity.status(201).body(dispute);
    }

    @GetMapping
    public ResponseEntity<List<Dispute>> getAllDisputes(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(disputeService.getAllDisputes(role, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisputeDetailResponse> getDisputeById(
            @PathVariable Long id,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");
        DisputeDetailResponse detail = disputeService.getDisputeById(id);
        // Customers can only see their own disputes
        if ("CUSTOMER".equals(role) && !detail.getDispute().getCustomerId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(detail);
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<Dispute> setUnderReview(
            @PathVariable Long id,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(disputeService.setUnderReview(id, email));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Dispute> resolveDispute(
            @PathVariable Long id,
            @RequestBody ResolveDisputeRequest request,
            HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        Long adminId = (Long) httpRequest.getAttribute("userId");
        String email = (String) httpRequest.getAttribute("userEmail");
        return ResponseEntity.ok(disputeService.resolveDispute(id, request.getResolution(), adminId, email));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Dispute> rejectDispute(
            @PathVariable Long id,
            @RequestBody ResolveDisputeRequest request,
            HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        Long adminId = (Long) httpRequest.getAttribute("userId");
        String email = (String) httpRequest.getAttribute("userEmail");
        return ResponseEntity.ok(disputeService.rejectDispute(id, request.getResolution(), adminId, email));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<DisputeNote> addNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        String email = (String) request.getAttribute("userEmail");
        return ResponseEntity.ok(disputeService.addNote(id, body.get("note"), email, role));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DisputeStats> getStats(HttpServletRequest request) {
        return ResponseEntity.ok(disputeService.getStats());
    }
}


package com.courierproof.evidenceservice.controller;

import com.courierproof.evidenceservice.entity.Evidence;
import com.courierproof.evidenceservice.service.EvidenceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/evidence")
// CORS managed centrally by Gateway
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Evidence> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("shipmentId") Long shipmentId,
            @RequestParam("receiverName") String receiverName,
            @RequestParam(value = "deliveryNotes", required = false) String deliveryNotes,
            @RequestParam(value = "gpsLocation", required = false) String gpsLocation,
            @RequestParam(value = "signature", required = false) String signature,
            HttpServletRequest request) throws IOException {

        Long courierId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("userRole");
        if (!"COURIER".equals(role) && !"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        Evidence evidence = evidenceService.uploadEvidence(
                file, shipmentId, courierId, receiverName, deliveryNotes, gpsLocation, signature);
        return ResponseEntity.status(201).body(evidence);
    }

    @GetMapping("/{evidenceId}")
    public ResponseEntity<Evidence> getEvidence(@PathVariable String evidenceId) {
        return ResponseEntity.ok(evidenceService.getByEvidenceId(evidenceId));
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<Evidence>> getEvidenceByShipment(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(evidenceService.getByShipmentId(shipmentId));
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = evidenceService.getUploadPath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


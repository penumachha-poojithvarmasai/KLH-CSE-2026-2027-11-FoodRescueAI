package com.courierproof.evidenceservice.service;

import com.courierproof.evidenceservice.entity.Evidence;
import com.courierproof.evidenceservice.repository.EvidenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;

    @Value("${evidence.upload-dir:uploads/evidence}")
    private String uploadDir;

    public Evidence uploadEvidence(MultipartFile file, Long shipmentId, Long courierId,
                                    String receiverName, String deliveryNotes,
                                    String gpsLocation, String signature) throws IOException {
        // Create upload directory
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique file name
        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String storedFilename = UUID.randomUUID() + ext;
        Path filePath = uploadPath.resolve(storedFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Compute SHA-256 checksum
        String checksum = computeChecksum(file.getBytes());

        // Save evidence record
        Evidence evidence = Evidence.builder()
                .evidenceId(UUID.randomUUID().toString())
                .shipmentId(shipmentId)
                .uploadedByCourierId(courierId)
                .imageUrl("/api/evidence/uploads/" + storedFilename)
                .imageFileName(storedFilename)
                .checksum(checksum)
                .receiverName(receiverName)
                .deliveryNotes(deliveryNotes)
                .gpsLocation(gpsLocation)
                .receiverSignature(signature)
                .deliveredAt(LocalDateTime.now())
                .uploadStatus("VERIFIED")
                .build();

        return evidenceRepository.save(evidence);
    }

    public Evidence getByEvidenceId(String evidenceId) {
        return evidenceRepository.findByEvidenceId(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found: " + evidenceId));
    }

    public List<Evidence> getByShipmentId(Long shipmentId) {
        return evidenceRepository.findByShipmentId(shipmentId);
    }

    public Path getUploadPath() {
        return Paths.get(uploadDir);
    }

    private String computeChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "checksum-error";
        }
    }
}


package com.courierproof.evidenceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String evidenceId;        // UUID

    private Long shipmentId;
    private Long uploadedByCourierId;
    private String imageUrl;
    private String imageFileName;
    private String checksum;          // SHA-256

    private String receiverName;
    private String receiverSignature;
    private String deliveryNotes;
    private String gpsLocation;

    private LocalDateTime deliveredAt;

    @Builder.Default
    private String uploadStatus = "VERIFIED";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}


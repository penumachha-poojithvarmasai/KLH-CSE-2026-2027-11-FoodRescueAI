package com.courierproof.disputeservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String disputeRef;       // e.g., DISP-2024-001

    private Long shipmentId;
    private String trackingId;
    private Long customerId;

    @Column(nullable = false)
    private String reason;           // PACKAGE_NOT_RECEIVED, DAMAGED, WRONG_ITEM, LATE_DELIVERY, OTHER

    @Column(length = 1000)
    private String description;

    @Builder.Default
    private String status = "OPEN";  // OPEN, UNDER_REVIEW, RESOLVED, REJECTED

    @Column(length = 1000)
    private String resolution;

    private Long resolvedByAdminId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
}


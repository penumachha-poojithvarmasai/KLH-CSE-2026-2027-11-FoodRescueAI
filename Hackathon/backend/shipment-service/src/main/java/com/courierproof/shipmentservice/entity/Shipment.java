package com.courierproof.shipmentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingId;

    private Long customerId;
    private Long courierId;
    private String originAddress;
    private String destinationAddress;

    @Builder.Default
    private String currentStatus = "PENDING";

    private LocalDateTime estimatedDelivery;
    private LocalDateTime actualDelivery;
    private String recipientName;
    private String recipientPhone;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}

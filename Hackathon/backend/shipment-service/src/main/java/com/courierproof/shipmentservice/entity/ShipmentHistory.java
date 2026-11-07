package com.courierproof.shipmentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shipmentId;
    private String status;
    private String note;
    private String performedBy;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}

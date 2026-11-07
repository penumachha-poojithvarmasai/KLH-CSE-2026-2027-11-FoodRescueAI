package com.courierproof.shipmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShipmentRequest {
    @NotBlank
    private String trackingId;
    @NotNull
    private Long customerId;
    @NotNull
    private Long courierId;
    @NotBlank
    private String originAddress;
    @NotBlank
    private String destinationAddress;
    private LocalDateTime estimatedDelivery;
    private String recipientName;
    private String recipientPhone;
}

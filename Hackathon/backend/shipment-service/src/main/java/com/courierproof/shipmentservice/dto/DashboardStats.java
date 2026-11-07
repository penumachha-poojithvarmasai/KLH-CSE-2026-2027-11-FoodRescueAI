package com.courierproof.shipmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalShipments;
    private long delivered;
    private long inTransit;
    private long pending;
}

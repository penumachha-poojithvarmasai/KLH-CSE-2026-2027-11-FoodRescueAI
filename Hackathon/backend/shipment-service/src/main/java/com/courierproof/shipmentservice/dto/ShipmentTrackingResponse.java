package com.courierproof.shipmentservice.dto;

import com.courierproof.shipmentservice.entity.Shipment;
import com.courierproof.shipmentservice.entity.ShipmentHistory;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ShipmentTrackingResponse {
    private Shipment shipment;
    private List<ShipmentHistory> history;
}

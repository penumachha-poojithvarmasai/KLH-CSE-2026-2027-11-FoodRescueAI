package com.courierproof.shipmentservice.service;

import com.courierproof.shipmentservice.dto.*;
import com.courierproof.shipmentservice.entity.Shipment;
import com.courierproof.shipmentservice.entity.ShipmentHistory;
import com.courierproof.shipmentservice.repository.ShipmentHistoryRepository;
import com.courierproof.shipmentservice.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentHistoryRepository historyRepository;

    public ShipmentTrackingResponse trackShipment(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + trackingId));
        List<ShipmentHistory> history = historyRepository.findByShipmentIdOrderByTimestampAsc(shipment.getId());
        return new ShipmentTrackingResponse(shipment, history);
    }

    public List<Shipment> getAllShipments(String role, Long userId) {
        if ("ADMIN".equals(role)) {
            return shipmentRepository.findAll();
        } else if ("COURIER".equals(role)) {
            return shipmentRepository.findByCourierId(userId);
        } else {
            return shipmentRepository.findByCustomerId(userId);
        }
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + id));
    }

    @Transactional
    public Shipment createShipment(ShipmentRequest request, String performedBy) {
        Shipment shipment = Shipment.builder()
                .trackingId(request.getTrackingId())
                .customerId(request.getCustomerId())
                .courierId(request.getCourierId())
                .originAddress(request.getOriginAddress())
                .destinationAddress(request.getDestinationAddress())
                .estimatedDelivery(request.getEstimatedDelivery())
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .currentStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        shipment = shipmentRepository.save(shipment);

        ShipmentHistory history = ShipmentHistory.builder()
                .shipmentId(shipment.getId())
                .status("PENDING")
                .note("Shipment created")
                .performedBy(performedBy)
                .timestamp(LocalDateTime.now())
                .build();
        historyRepository.save(history);
        return shipment;
    }

    @Transactional
    public Shipment updateStatus(Long id, StatusUpdateRequest request, String performedBy) {
        Shipment shipment = getShipmentById(id);
        shipment.setCurrentStatus(request.getStatus());
        shipment.setUpdatedAt(LocalDateTime.now());
        if ("DELIVERED".equals(request.getStatus())) {
            shipment.setActualDelivery(LocalDateTime.now());
        }
        shipmentRepository.save(shipment);

        ShipmentHistory history = ShipmentHistory.builder()
                .shipmentId(id)
                .status(request.getStatus())
                .note(request.getNote())
                .performedBy(performedBy)
                .timestamp(LocalDateTime.now())
                .build();
        historyRepository.save(history);
        return shipment;
    }

    public List<Shipment> getCourierShipments(Long courierId) {
        return shipmentRepository.findByCourierId(courierId);
    }

    public DashboardStats getDashboardStats() {
        List<Shipment> all = shipmentRepository.findAll();
        long delivered = all.stream().filter(s -> "DELIVERED".equals(s.getCurrentStatus())).count();
        long inTransit = all.stream().filter(s -> "IN_TRANSIT".equals(s.getCurrentStatus())).count();
        long pending = all.stream().filter(s -> "PENDING".equals(s.getCurrentStatus())).count();
        return new DashboardStats(all.size(), delivered, inTransit, pending);
    }
}

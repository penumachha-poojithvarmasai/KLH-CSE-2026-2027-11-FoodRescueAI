package com.courierproof.shipmentservice.controller;

import com.courierproof.shipmentservice.dto.*;
import com.courierproof.shipmentservice.entity.Shipment;
import com.courierproof.shipmentservice.service.ShipmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
// CORS managed centrally by Gateway
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<ShipmentTrackingResponse> trackShipment(@PathVariable String trackingId) {
        return ResponseEntity.ok(shipmentService.trackShipment(trackingId));
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(shipmentService.getAllShipments(role, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentById(
            @PathVariable Long id,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");
        Shipment shipment = shipmentService.getShipmentById(id);
        // Customers can only see their own shipments
        if ("CUSTOMER".equals(role) && !shipment.getCustomerId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(shipmentService.trackShipment(shipment.getTrackingId()));
    }

    @PostMapping
    public ResponseEntity<Shipment> createShipment(
            @Valid @RequestBody ShipmentRequest request,
            HttpServletRequest httpRequest) {
        String email = (String) httpRequest.getAttribute("userEmail");
        return ResponseEntity.status(201).body(shipmentService.createShipment(request, email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request,
            HttpServletRequest httpRequest) {
        String role = (String) httpRequest.getAttribute("userRole");
        Long userId = (Long) httpRequest.getAttribute("userId");
        String email = (String) httpRequest.getAttribute("userEmail");

        Shipment shipment = shipmentService.getShipmentById(id);
        if ("COURIER".equals(role) && !shipment.getCourierId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(shipmentService.updateStatus(id, request, email));
    }

    @GetMapping("/courier/{courierId}")
    public ResponseEntity<List<Shipment>> getCourierShipments(@PathVariable Long courierId) {
        return ResponseEntity.ok(shipmentService.getCourierShipments(courierId));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(shipmentService.getDashboardStats());
    }
}


package com.courierproof.shipmentservice.repository;

import com.courierproof.shipmentservice.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingId(String trackingId);
    List<Shipment> findByCustomerId(Long customerId);
    List<Shipment> findByCourierId(Long courierId);
}

package com.courierproof.shipmentservice.repository;

import com.courierproof.shipmentservice.entity.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentHistoryRepository extends JpaRepository<ShipmentHistory, Long> {
    List<ShipmentHistory> findByShipmentIdOrderByTimestampAsc(Long shipmentId);
}

package com.courierproof.shipmentservice.init;

import com.courierproof.shipmentservice.entity.Shipment;
import com.courierproof.shipmentservice.entity.ShipmentHistory;
import com.courierproof.shipmentservice.repository.ShipmentHistoryRepository;
import com.courierproof.shipmentservice.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentHistoryRepository historyRepository;

    @Override
    public void run(String... args) {
        if (shipmentRepository.count() == 0) {
            log.info("Seeding demo shipment data...");
            seedShipments();
            log.info("Demo shipments initialized.");
        }
    }

    private void seedShipments() {
        LocalDateTime now = LocalDateTime.now();

        Shipment s1 = shipmentRepository.save(Shipment.builder()
                .trackingId("CP-2024-001")
                .customerId(1L)
                .courierId(2L)
                .originAddress("123 Sender Street, Mumbai, MH 400001")
                .destinationAddress("456 Receiver Avenue, Delhi, DL 110001")
                .currentStatus("DELIVERED")
                .estimatedDelivery(now.minusDays(1))
                .actualDelivery(now.minusDays(1).withHour(14))
                .recipientName("Rahul Sharma")
                .recipientPhone("9876543210")
                .createdAt(now.minusDays(5))
                .updatedAt(now.minusDays(1))
                .build());

        historyRepository.saveAll(List.of(
            ShipmentHistory.builder().shipmentId(s1.getId()).status("PENDING")
                .note("Shipment created and processed").performedBy("system")
                .timestamp(now.minusDays(5)).build(),
            ShipmentHistory.builder().shipmentId(s1.getId()).status("IN_TRANSIT")
                .note("Package picked up from sender").performedBy("courier@demo.com")
                .timestamp(now.minusDays(3)).build(),
            ShipmentHistory.builder().shipmentId(s1.getId()).status("OUT_FOR_DELIVERY")
                .note("Package out for delivery").performedBy("courier@demo.com")
                .timestamp(now.minusDays(1).withHour(9)).build(),
            ShipmentHistory.builder().shipmentId(s1.getId()).status("DELIVERED")
                .note("Package delivered to recipient").performedBy("courier@demo.com")
                .timestamp(now.minusDays(1).withHour(14)).build()
        ));

        Shipment s2 = shipmentRepository.save(Shipment.builder()
                .trackingId("CP-2024-002")
                .customerId(1L)
                .courierId(2L)
                .originAddress("789 Shop Road, Bangalore, KA 560001")
                .destinationAddress("456 Receiver Avenue, Delhi, DL 110001")
                .currentStatus("IN_TRANSIT")
                .estimatedDelivery(now.plusDays(2))
                .recipientName("Rahul Sharma")
                .recipientPhone("9876543210")
                .createdAt(now.minusDays(2))
                .build());

        historyRepository.saveAll(List.of(
            ShipmentHistory.builder().shipmentId(s2.getId()).status("PENDING")
                .note("Shipment created").performedBy("system")
                .timestamp(now.minusDays(2)).build(),
            ShipmentHistory.builder().shipmentId(s2.getId()).status("IN_TRANSIT")
                .note("Package picked up").performedBy("courier@demo.com")
                .timestamp(now.minusDays(1)).build()
        ));

        Shipment s3 = shipmentRepository.save(Shipment.builder()
                .trackingId("CP-2024-003")
                .customerId(1L)
                .courierId(2L)
                .originAddress("321 Warehouse Lane, Chennai, TN 600001")
                .destinationAddress("456 Receiver Avenue, Delhi, DL 110001")
                .currentStatus("OUT_FOR_DELIVERY")
                .estimatedDelivery(now.plusHours(6))
                .recipientName("Rahul Sharma")
                .recipientPhone("9876543210")
                .createdAt(now.minusDays(1))
                .build());

        historyRepository.saveAll(List.of(
            ShipmentHistory.builder().shipmentId(s3.getId()).status("PENDING")
                .note("Shipment created").performedBy("system")
                .timestamp(now.minusDays(1)).build(),
            ShipmentHistory.builder().shipmentId(s3.getId()).status("IN_TRANSIT")
                .note("Package picked up").performedBy("courier@demo.com")
                .timestamp(now.minusHours(8)).build(),
            ShipmentHistory.builder().shipmentId(s3.getId()).status("OUT_FOR_DELIVERY")
                .note("Out for delivery").performedBy("courier@demo.com")
                .timestamp(now.minusHours(2)).build()
        ));
    }
}


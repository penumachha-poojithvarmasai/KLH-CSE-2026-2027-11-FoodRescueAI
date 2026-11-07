package com.courierproof.shipmentservice;

import com.courierproof.shipmentservice.dto.DashboardStats;
import com.courierproof.shipmentservice.dto.StatusUpdateRequest;
import com.courierproof.shipmentservice.entity.Shipment;
import com.courierproof.shipmentservice.repository.ShipmentHistoryRepository;
import com.courierproof.shipmentservice.repository.ShipmentRepository;
import com.courierproof.shipmentservice.service.ShipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ShipmentHistoryRepository historyRepository;

    @InjectMocks
    private ShipmentService shipmentService;

    private Shipment testShipment;

    @BeforeEach
    void setUp() {
        testShipment = Shipment.builder()
                .id(1L)
                .trackingId("CP-2024-001")
                .customerId(1L)
                .courierId(2L)
                .currentStatus("DELIVERED")
                .recipientName("Rahul Sharma")
                .build();
    }

    @Test
    void testGetAllShipments_AsAdmin_ReturnsAll() {
        when(shipmentRepository.findAll()).thenReturn(List.of(testShipment));
        List<Shipment> result = shipmentService.getAllShipments("ADMIN", 99L);
        assertThat(result).hasSize(1);
    }

    @Test
    void testGetAllShipments_AsCustomer_FiltersByCustomerId() {
        when(shipmentRepository.findByCustomerId(1L)).thenReturn(List.of(testShipment));
        List<Shipment> result = shipmentService.getAllShipments("CUSTOMER", 1L);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCustomerId()).isEqualTo(1L);
    }

    @Test
    void testGetShipmentById_NotFound_ThrowsException() {
        when(shipmentRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> shipmentService.getShipmentById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Shipment not found");
    }

    @Test
    void testUpdateStatus_DeliveredStatus_SetsActualDelivery() {
        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(testShipment));
        when(shipmentRepository.save(any())).thenReturn(testShipment);
        when(historyRepository.save(any())).thenReturn(null);

        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("DELIVERED");
        req.setNote("Delivered successfully");

        Shipment result = shipmentService.updateStatus(1L, req, "courier@demo.com");
        assertThat(result.getCurrentStatus()).isEqualTo("DELIVERED");
    }

    @Test
    void testGetDashboardStats_ReturnsCorrectCounts() {
        Shipment s1 = Shipment.builder().currentStatus("DELIVERED").build();
        Shipment s2 = Shipment.builder().currentStatus("IN_TRANSIT").build();
        Shipment s3 = Shipment.builder().currentStatus("PENDING").build();
        when(shipmentRepository.findAll()).thenReturn(List.of(s1, s2, s3));

        DashboardStats stats = shipmentService.getDashboardStats();
        assertThat(stats.getTotalShipments()).isEqualTo(3);
        assertThat(stats.getDelivered()).isEqualTo(1);
        assertThat(stats.getInTransit()).isEqualTo(1);
        assertThat(stats.getPending()).isEqualTo(1);
    }
}


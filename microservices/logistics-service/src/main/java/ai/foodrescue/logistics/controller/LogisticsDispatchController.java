package ai.foodrescue.logistics.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/logistics")
public class LogisticsDispatchController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "FoodRescue AI - Logistics & Dispatch Telemetry Service");
        response.put("status", "UP");
        response.put("port", 8085);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fleet-telemetry")
    public ResponseEntity<Map<String, Object>> getFleetTelemetry() {
        Map<String, Object> telemetry = new HashMap<>();
        telemetry.put("activeVans", 4);
        telemetry.put("fleetType", "100% Zero-Emission Electric Vans");
        telemetry.put("coldChainTemperatureCelsius", 3.8);
        telemetry.put("temperatureSafetyStatus", "NORMAL_SAFE");
        telemetry.put("averageEtaMinutes", 14.5);
        telemetry.put("totalKmToday", 86.4);
        telemetry.put("co2SavingsKg", 216.0);
        return ResponseEntity.ok(telemetry);
    }
}

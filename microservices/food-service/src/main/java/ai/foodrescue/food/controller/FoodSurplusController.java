package ai.foodrescue.food.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/food")
public class FoodSurplusController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "FoodRescue AI - Food Surplus Service");
        response.put("status", "UP");
        response.put("port", 8082);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate-perishability")
    public ResponseEntity<Map<String, Object>> evaluatePerishability(@RequestBody Map<String, Object> payload) {
        String category = (String) payload.getOrDefault("category", "Cooked Meals");
        String storage = (String) payload.getOrDefault("storageCondition", "Hot Held");
        
        int usableHours = 4;
        String urgency = "MEDIUM";
        String perishability = "MEDIUM";

        if ("Cooked Meals".equalsIgnoreCase(category)) {
            usableHours = "Hot Held".equalsIgnoreCase(storage) ? 3 : 6;
            urgency = usableHours <= 3 ? "CRITICAL" : "HIGH";
            perishability = "CRITICAL";
        } else if ("Dairy".equalsIgnoreCase(category)) {
            usableHours = 24;
            urgency = "HIGH";
            perishability = "HIGH";
        } else if ("Bakery".equalsIgnoreCase(category)) {
            usableHours = 24;
            urgency = "MEDIUM";
            perishability = "MEDIUM";
        } else {
            usableHours = 48;
            urgency = "LOW";
            perishability = "LOW";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("category", category);
        result.put("storageCondition", storage);
        result.put("estimatedUsableHours", usableHours);
        result.put("urgencyLevel", urgency);
        result.put("perishabilityTier", perishability);
        result.put("evaluationEngine", "Spring Boot Food Surplus Rule Analyzer");
        return ResponseEntity.ok(result);
    }
}

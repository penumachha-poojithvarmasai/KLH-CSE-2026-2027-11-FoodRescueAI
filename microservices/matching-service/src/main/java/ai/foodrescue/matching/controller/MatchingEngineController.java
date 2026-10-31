package ai.foodrescue.matching.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/matching")
public class MatchingEngineController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "FoodRescue AI - AI Matching & Decision Engine");
        response.put("status", "UP");
        response.put("port", 8084);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate-score")
    public ResponseEntity<Map<String, Object>> calculate5FactorScore(@RequestBody Map<String, Object> request) {
        double distanceKm = ((Number) request.getOrDefault("distanceKm", 2.4)).doubleValue();
        int requestedQuantity = ((Number) request.getOrDefault("quantity", 50)).intValue();
        int availableCapacity = ((Number) request.getOrDefault("availableCapacity", 120)).intValue();
        String needLevel = (String) request.getOrDefault("needLevel", "CRITICAL");
        String urgency = (String) request.getOrDefault("urgency", "HIGH");
        
        boolean isCategoryAccepted = true;
        if (request.containsKey("isCategoryAccepted")) {
            isCategoryAccepted = Boolean.TRUE.equals(request.get("isCategoryAccepted"));
        } else if (request.containsKey("categoryCompatibility")) {
            Object compVal = request.get("categoryCompatibility");
            if (compVal instanceof Boolean) {
                isCategoryAccepted = (Boolean) compVal;
            }
        }
        
        // 5-Factor Score Calculations (Formulated in docs/MATCHING_ALGORITHM.md & matchingEngine.ts)
        // 1. Category Compatibility (Max 25 pts)
        double compScore = isCategoryAccepted ? 25.0 : 5.0;

        // 2. Recipient Need Level (Max 25 pts)
        double needScore;
        if ("CRITICAL".equalsIgnoreCase(needLevel)) {
            needScore = 25.0;
        } else if ("HIGH".equalsIgnoreCase(needLevel)) {
            needScore = 20.0;
        } else if ("MEDIUM".equalsIgnoreCase(needLevel)) {
            needScore = 15.0;
        } else {
            needScore = 10.0;
        }

        // 3. Capacity Match (Max 20 pts)
        int servings = Math.max(1, requestedQuantity);
        double capacityRatio = (double) availableCapacity / servings;
        double capScore;
        if (capacityRatio >= 1.0) {
            capScore = 20.0;
        } else if (capacityRatio >= 0.7) {
            capScore = 16.0;
        } else if (capacityRatio >= 0.4) {
            capScore = 12.0;
        } else {
            capScore = 6.0;
        }

        // 4. Distance / Proximity (Max 15 pts)
        double distScore;
        if (distanceKm <= 3.0) {
            distScore = 15.0;
        } else if (distanceKm <= 6.0) {
            distScore = 12.0;
        } else if (distanceKm <= 10.0) {
            distScore = 9.0;
        } else if (distanceKm <= 15.0) {
            distScore = 6.0;
        } else {
            distScore = 3.0;
        }

        // 5. Operating Hours & Urgency Window (Max 15 pts)
        double availScore;
        if ("CRITICAL".equalsIgnoreCase(urgency) && "CRITICAL".equalsIgnoreCase(needLevel)) {
            availScore = 15.0;
        } else if ("HIGH".equalsIgnoreCase(urgency)) {
            availScore = 13.0;
        } else {
            availScore = 11.0;
        }

        double overallScore = compScore + needScore + capScore + distScore + availScore;

        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("categoryCompatibilityScore", compScore);
        breakdown.put("needLevelScore", needScore);
        breakdown.put("capacityMatchScore", capScore);
        breakdown.put("distanceScore", distScore);
        breakdown.put("availabilityScore", availScore);

        String suitabilityStatus;
        if (overallScore >= 85.0) {
            suitabilityStatus = "OPTIMAL";
        } else if (overallScore >= 70.0) {
            suitabilityStatus = "GOOD";
        } else if (overallScore >= 50.0) {
            suitabilityStatus = "MODERATE";
        } else {
            suitabilityStatus = "POOR";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("overallScore", Math.round(overallScore * 10.0) / 10.0);
        result.put("breakdown", breakdown);
        result.put("suitabilityStatus", suitabilityStatus);
        result.put("algorithmEngine", "Spring Boot 5-Factor Deterministic Decision Engine (IEEE Formulated)");
        return ResponseEntity.ok(result);
    }
}

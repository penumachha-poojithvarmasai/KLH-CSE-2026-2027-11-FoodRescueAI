package com.courierproof.disputeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDisputeRequest {
    @NotBlank(message = "Tracking ID is required")
    private String trackingId;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;
}


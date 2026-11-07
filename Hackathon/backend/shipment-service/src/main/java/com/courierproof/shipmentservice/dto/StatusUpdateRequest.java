package com.courierproof.shipmentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotBlank
    private String status;
    private String note;
}

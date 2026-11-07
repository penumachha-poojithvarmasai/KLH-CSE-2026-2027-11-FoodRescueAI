package com.courierproof.disputeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DisputeStats {
    private long open;
    private long underReview;
    private long resolved;
    private long rejected;
    private long total;
}


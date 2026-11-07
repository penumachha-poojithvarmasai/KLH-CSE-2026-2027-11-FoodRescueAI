package com.courierproof.disputeservice.dto;

import com.courierproof.disputeservice.entity.Dispute;
import com.courierproof.disputeservice.entity.DisputeNote;
import lombok.Data;
import java.util.List;

@Data
public class DisputeDetailResponse {
    private Dispute dispute;
    private List<DisputeNote> notes;

    public DisputeDetailResponse(Dispute dispute, List<DisputeNote> notes) {
        this.dispute = dispute;
        this.notes = notes;
    }
}


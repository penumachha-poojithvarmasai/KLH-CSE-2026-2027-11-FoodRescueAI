package com.courierproof.disputeservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispute_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long disputeId;

    @Column(length = 2000)
    private String note;

    private String addedBy;
    private String addedByRole;

    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();
}


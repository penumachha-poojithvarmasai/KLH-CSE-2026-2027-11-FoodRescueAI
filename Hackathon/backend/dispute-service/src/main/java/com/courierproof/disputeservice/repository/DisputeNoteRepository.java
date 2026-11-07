package com.courierproof.disputeservice.repository;

import com.courierproof.disputeservice.entity.DisputeNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DisputeNoteRepository extends JpaRepository<DisputeNote, Long> {
    List<DisputeNote> findByDisputeIdOrderByAddedAtAsc(Long disputeId);
}


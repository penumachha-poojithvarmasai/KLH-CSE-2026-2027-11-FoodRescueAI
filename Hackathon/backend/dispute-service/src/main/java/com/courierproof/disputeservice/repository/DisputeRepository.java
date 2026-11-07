package com.courierproof.disputeservice.repository;

import com.courierproof.disputeservice.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByCustomerId(Long customerId);
    List<Dispute> findByStatus(String status);
    Optional<Dispute> findByDisputeRef(String disputeRef);
    long countByStatus(String status);
}


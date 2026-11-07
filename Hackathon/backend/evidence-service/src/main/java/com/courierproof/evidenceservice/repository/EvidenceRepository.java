package com.courierproof.evidenceservice.repository;

import com.courierproof.evidenceservice.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    Optional<Evidence> findByEvidenceId(String evidenceId);
    List<Evidence> findByShipmentId(Long shipmentId);
    Optional<Evidence> findFirstByShipmentId(Long shipmentId);
}


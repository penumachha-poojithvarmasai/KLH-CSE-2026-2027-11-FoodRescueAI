package com.courierproof.auditservice.repository;

import com.courierproof.auditservice.entity.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditRecordRepository extends JpaRepository<AuditRecord, Long> {
    List<AuditRecord> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);
    List<AuditRecord> findTop20ByOrderByTimestampDesc();
}


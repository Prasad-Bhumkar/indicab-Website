package com.indicab.repository;

import com.indicab.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for AuditLog entity
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    
    /**
     * Find audit logs by user ID with pagination
     */
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find audit logs by operation type
     */
    Page<AuditLog> findByOperation(String operation, Pageable pageable);
    
    /**
     * Find audit logs by resource type
     */
    Page<AuditLog> findByResourceType(String resourceType, Pageable pageable);
    
    /**
     * Find audit logs by user and operation
     */
    Page<AuditLog> findByUserIdAndOperation(Long userId, String operation, Pageable pageable);
    
    /**
     * Find audit logs by date range
     */
    List<AuditLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find failed audit logs
     */
    Page<AuditLog> findByStatus(String status, Pageable pageable);
    
    /**
     * Count audit logs for specific operation
     */
    long countByOperation(String operation);
    
    /**
     * Count audit logs for specific user
     */
    long countByUserId(Long userId);
}

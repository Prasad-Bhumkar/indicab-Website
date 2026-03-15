package com.indicab.service;

import com.indicab.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for audit logging
 * Tracks sensitive operations for compliance and security monitoring
 */
public interface AuditLoggingService {
    
    /**
     * Log a user operation
     */
    void logOperation(Long userId, String operation, String resourceType, String ipAddress);
    
    /**
     * Log a user operation with resource ID
     */
    void logOperation(Long userId, String operation, String resourceType, Long resourceId, String ipAddress);
    
    /**
     * Log an operation with additional details
     */
    void logOperation(Long userId, String operation, String resourceType, Long resourceId, 
                     String details, String ipAddress, String userAgent);
    
    /**
     * Log a failed operation
     */
    void logFailedOperation(Long userId, String operation, String resourceType, 
                           String ipAddress, String failureReason);
    
    /**
     * Get audit logs for a specific user
     */
    Page<AuditLog> getUserAuditLogs(Long userId, Pageable pageable);
    
    /**
     * Get audit logs for a specific operation type
     */
    Page<AuditLog> getOperationAuditLogs(String operation, Pageable pageable);
    
    /**
     * Get audit logs for a specific resource type
     */
    Page<AuditLog> getResourceAuditLogs(String resourceType, Pageable pageable);
    
    /**
     * Get audit logs within a date range
     */
    List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get failed operations
     */
    Page<AuditLog> getFailedOperations(Pageable pageable);
    
    /**
     * Get statistics for audit logging
     */
    String getAuditStatistics();

    /**
     * Log a bulk operation
     */
    void logBulkOperation(Long userId, String operation, String resourceType,
                         List<Long> resourceIds, String ipAddress, String details);

    /**
     * Log a failed bulk operation
     */
    void logFailedBulkOperation(Long userId, String operation, String resourceType,
                               List<Long> resourceIds, String ipAddress, String failureReason);

    /**
     * Get audit logs with search/filter specifications
     */
    Page<AuditLog> getAuditLogs(Pageable pageable, Specification<AuditLog> spec);
}

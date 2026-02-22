package com.indicab.service.impl;

import com.indicab.controller.AdminWebSocketController;
import com.indicab.entity.AuditLog;
import com.indicab.repository.AuditLogRepository;
import com.indicab.service.AuditLoggingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Implementation of AuditLoggingService
 * Handles logging of sensitive operations for audit trail and compliance
 */
@Service
public class AuditLoggingServiceImpl implements AuditLoggingService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLoggingServiceImpl.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AdminWebSocketController adminWebSocketController;

    // Statistics tracking
    private final AtomicLong totalOperations = new AtomicLong(0);
    private final AtomicLong failedOperations = new AtomicLong(0);

    @Override
    public void logOperation(Long userId, String operation, String resourceType, String ipAddress) {
        logOperation(userId, operation, resourceType, null, null, ipAddress, null);
    }

    @Override
    public void logOperation(Long userId, String operation, String resourceType, Long resourceId, String ipAddress) {
        logOperation(userId, operation, resourceType, resourceId, null, ipAddress, null);
    }

    @Override
    public void logOperation(Long userId, String operation, String resourceType, Long resourceId,
                            String details, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setOperation(operation);
            auditLog.setResourceType(resourceType);
            auditLog.setResourceId(resourceId);
            auditLog.setDetails(details);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setStatus("SUCCESS");
            auditLog.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(auditLog);
            totalOperations.incrementAndGet();

            // Notify admin via WebSocket
            adminWebSocketController.broadcastNewAuditLog(auditLog);

            logger.info("Audit log recorded - User: {}, Operation: {}, Resource: {} (ID: {}), IP: {}",
                       userId, operation, resourceType, resourceId, ipAddress);

        } catch (Exception e) {
            logger.error("Failed to log operation: {}", operation, e);
        }
    }

    @Override
    public void logFailedOperation(Long userId, String operation, String resourceType,
                                   String ipAddress, String failureReason) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setOperation(operation);
            auditLog.setResourceType(resourceType);
            auditLog.setStatus("FAILED");
            auditLog.setFailureReason(failureReason);
            auditLog.setIpAddress(ipAddress);
            auditLog.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(auditLog);
            totalOperations.incrementAndGet();
            failedOperations.incrementAndGet();

            // Notify admin via WebSocket
            adminWebSocketController.broadcastNewAuditLog(auditLog);

            logger.warn("Audit log recorded (FAILED) - User: {}, Operation: {}, Resource: {}, Reason: {}, IP: {}",
                       userId, operation, resourceType, failureReason, ipAddress);

        } catch (Exception e) {
            logger.error("Failed to log failed operation: {}", operation, e);
        }
    }

    @Override
    public Page<AuditLog> getUserAuditLogs(Long userId, Pageable pageable) {
        logger.debug("Fetching audit logs for user: {}", userId);
        return auditLogRepository.findByUserId(userId, pageable);
    }

    @Override
    public Page<AuditLog> getOperationAuditLogs(String operation, Pageable pageable) {
        logger.debug("Fetching audit logs for operation: {}", operation);
        return auditLogRepository.findByOperation(operation, pageable);
    }

    @Override
    public Page<AuditLog> getResourceAuditLogs(String resourceType, Pageable pageable) {
        logger.debug("Fetching audit logs for resource type: {}", resourceType);
        return auditLogRepository.findByResourceType(resourceType, pageable);
    }

    @Override
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Fetching audit logs between {} and {}", startDate, endDate);
        return auditLogRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    public Page<AuditLog> getFailedOperations(Pageable pageable) {
        logger.debug("Fetching failed audit operations");
        return auditLogRepository.findByStatus("FAILED", pageable);
    }

    @Override
    public String getAuditStatistics() {
        long totalLogs = auditLogRepository.count();
        long failedLogs = failedOperations.get();
        double failureRate = totalLogs > 0 ? (double) failedLogs / totalLogs * 100 : 0;

        return String.format("Total Operations: %d, Failed Operations: %d, Failure Rate: %.2f%%, Success Rate: %.2f%%",
                totalLogs, failedLogs, failureRate, 100 - failureRate);
    }

    /**
     * Reset statistics (useful for testing)
     */
    public void resetStatistics() {
        totalOperations.set(0);
        failedOperations.set(0);
        logger.info("Audit statistics reset");
    }

    @Override
    public void logBulkOperation(Long userId, String operation, String resourceType,
                                List<Long> resourceIds, String ipAddress, String details) {
        try {
            String bulkDetails = String.format("Bulk %s - IDs: %s. %s",
                                              operation, resourceIds, details);

            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setOperation("BULK_" + operation);
            auditLog.setResourceType(resourceType);
            auditLog.setDetails(bulkDetails);
            auditLog.setIpAddress(ipAddress);
            auditLog.setStatus("SUCCESS");
            auditLog.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(auditLog);
            totalOperations.incrementAndGet();

            // Notify admin via WebSocket about bulk operation
            if (adminWebSocketController != null) {
                String operationName = operation.toUpperCase();
                adminWebSocketController.broadcastBulkOperationComplete(
                    resourceType, operationName, resourceIds.size(), true,
                    "Successfully performed bulk " + operationName.toLowerCase()
                );
            }

            logger.info("Bulk audit log recorded - User: {}, Operation: BULK_{}, Resource: {}, Count: {}, IP: {}",
                       userId, operation, resourceType, resourceIds.size(), ipAddress);

        } catch (Exception e) {
            logger.error("Failed to log bulk operation: {}", operation, e);
        }
    }

    @Override
    public void logFailedBulkOperation(Long userId, String operation, String resourceType,
                                       List<Long> resourceIds, String ipAddress, String failureReason) {
        try {
            String bulkDetails = String.format("Bulk %s - IDs: %s", operation, resourceIds);

            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setOperation("BULK_" + operation);
            auditLog.setResourceType(resourceType);
            auditLog.setDetails(bulkDetails);
            auditLog.setStatus("FAILED");
            auditLog.setFailureReason(failureReason);
            auditLog.setIpAddress(ipAddress);
            auditLog.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(auditLog);
            totalOperations.incrementAndGet();
            failedOperations.incrementAndGet();

            // Notify admin via WebSocket about failed bulk operation
            if (adminWebSocketController != null) {
                String operationName = operation.toUpperCase();
                adminWebSocketController.broadcastBulkOperationComplete(
                    resourceType, operationName, resourceIds.size(), false, failureReason
                );
            }

            logger.warn("Bulk audit log recorded (FAILED) - User: {}, Operation: BULK_{}, Resource: {}, Count: {}, Reason: {}, IP: {}",
                       userId, operation, resourceType, resourceIds.size(), failureReason, ipAddress);

        } catch (Exception e) {
            logger.error("Failed to log failed bulk operation: {}", operation, e);
        }
    }

    /**
     * Get total operations count
     */
    public long getTotalOperationsCount() {
        return totalOperations.get();
    }

    /**
     * Get failed operations count
     */
    public long getFailedOperationsCount() {
        return failedOperations.get();
    }
}

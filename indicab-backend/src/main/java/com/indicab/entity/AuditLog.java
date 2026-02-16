package com.indicab.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for audit logging sensitive operations
 * Tracks user actions, payments, approvals, and deletions for compliance
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_operation", columnList = "operation"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String operation;

    @Column(nullable = false)
    private String resourceType;

    private Long resourceId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private String ipAddress;

    private String userAgent;

    @Column(nullable = false)
    private String status;

    private String failureReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public AuditLog() {}

    public AuditLog(Long userId, String operation, String resourceType, String ipAddress) {
        this.userId = userId;
        this.operation = operation;
        this.resourceType = resourceType;
        this.ipAddress = ipAddress;
        this.status = "SUCCESS";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return String.format("AuditLog{id=%d, userId=%d, operation='%s', resourceType='%s', status='%s', createdAt=%s}",
                id, userId, operation, resourceType, status, createdAt);
    }
}

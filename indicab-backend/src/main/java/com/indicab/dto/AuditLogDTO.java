package com.indicab.dto;

import java.time.LocalDateTime;

/**
 * DTO for AuditLog entity
 * Used for API responses to expose audit log information
 */
public class AuditLogDTO {
    
    private Long id;
    private Long userId;
    private String operation;
    private String resourceType;
    private Long resourceId;
    private String details;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String failureReason;
    private LocalDateTime createdAt;
    
    public AuditLogDTO() {}
    
    public AuditLogDTO(Long id, Long userId, String operation, String resourceType, 
                      Long resourceId, String status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.operation = operation;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.status = status;
        this.createdAt = createdAt;
    }
    
    public AuditLogDTO(Long id, Long userId, String operation, String resourceType, 
                      Long resourceId, String details, String ipAddress, String userAgent, 
                      String status, String failureReason, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.operation = operation;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.details = details;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.status = status;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
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
}

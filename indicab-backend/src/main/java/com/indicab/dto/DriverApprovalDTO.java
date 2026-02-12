package com.indicab.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for admin to approve or reject driver applications
 */
public class DriverApprovalDTO {
    
    @NotNull(message = "Driver ID is required")
    private Long driverId;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be either APPROVED or REJECTED")
    private String status;
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String rejectionReason;

    public DriverApprovalDTO() {}

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}

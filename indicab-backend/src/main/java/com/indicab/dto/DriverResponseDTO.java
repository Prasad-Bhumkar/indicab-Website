package com.indicab.dto;

import java.time.LocalDateTime;

/**
 * DTO for driver response in API endpoints
 * Includes driver-specific fields and approval status
 */
public class DriverResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String licenseNumber;
    private String vehicleType;
    private String driverStatus;
    private LocalDateTime driverAppliedAt;
    private LocalDateTime driverApprovedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DriverResponseDTO() {}

    public DriverResponseDTO(Long id, String name, String email, String phone, String address,
                           String licenseNumber, String vehicleType, String driverStatus,
                           LocalDateTime driverAppliedAt, LocalDateTime driverApprovedAt,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.licenseNumber = licenseNumber;
        this.vehicleType = vehicleType;
        this.driverStatus = driverStatus;
        this.driverAppliedAt = driverAppliedAt;
        this.driverApprovedAt = driverApprovedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getDriverStatus() { return driverStatus; }
    public void setDriverStatus(String driverStatus) { this.driverStatus = driverStatus; }

    public LocalDateTime getDriverAppliedAt() { return driverAppliedAt; }
    public void setDriverAppliedAt(LocalDateTime driverAppliedAt) { this.driverAppliedAt = driverAppliedAt; }

    public LocalDateTime getDriverApprovedAt() { return driverApprovedAt; }
    public void setDriverApprovedAt(LocalDateTime driverApprovedAt) { this.driverApprovedAt = driverApprovedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

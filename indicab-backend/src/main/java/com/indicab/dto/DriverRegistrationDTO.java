package com.indicab.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for driver registration/application
 */
public class DriverRegistrationDTO {
    
    @NotBlank(message = "License number is required")
    @Size(min = 5, max = 50, message = "License number must be between 5 and 50 characters")
    private String licenseNumber;
    
    @NotBlank(message = "Vehicle type is required")
    @Size(min = 2, max = 50, message = "Vehicle type must be between 2 and 50 characters")
    private String vehicleType;
    
    private String vehicleNumber;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+?91)?[6-9]\\d{9}$", message = "Phone number must be a valid Indian number")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 255, message = "Address must be between 10 and 255 characters")
    private String address;

    public DriverRegistrationDTO() {}

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}

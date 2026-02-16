package com.indicab.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for booking request with validation
 */
public class BookingRequestDTO {
    
    @NotBlank(message = "Starting location is required")
    private String from;
    
    @NotBlank(message = "Destination location is required")
    private String to;
    
    @NotBlank(message = "Date is required")
    private String date;
    
    @NotBlank(message = "Vehicle type is required")
    private String vehicle;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private Double amount;
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    @NotBlank(message = "License is required")
    private String license;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+?91)?[6-9]\\d{9}$", message = "Phone number must be a valid Indian number (10 digits or +91 format)")
    private String phoneNumber;
    
    @NotBlank(message = "Pickup address is required")
    @Size(min = 5, max = 255, message = "Pickup address must be between 5 and 255 characters")
    private String pickupAddress;

    @NotBlank(message = "Dropoff address is required")
    @Size(min = 5, max = 255, message = "Dropoff address must be between 5 and 255 characters")
    private String dropoffAddress;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private Integer passengerCount = 1;

    private String specialRequirements;

    private String contactPreference = "call";

    private String status = "PENDING";

    public BookingRequestDTO() {}

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getDropoffAddress() { return dropoffAddress; }
    public void setDropoffAddress(String dropoffAddress) { this.dropoffAddress = dropoffAddress; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getPassengerCount() { return passengerCount; }
    public void setPassengerCount(Integer passengerCount) { this.passengerCount = passengerCount; }

    public String getSpecialRequirements() { return specialRequirements; }
    public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }

    public String getContactPreference() { return contactPreference; }
    public void setContactPreference(String contactPreference) { this.contactPreference = contactPreference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

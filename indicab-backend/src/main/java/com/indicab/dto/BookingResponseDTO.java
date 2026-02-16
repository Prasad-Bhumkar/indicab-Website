package com.indicab.dto;

/**
 * DTO for booking response in API endpoints
 */
public class BookingResponseDTO {
    private Long id;
    private String from;
    private String to;
    private String date;
    private String vehicle;
    private Double amount;
    private String fullName;
    private String license;
    private String phoneNumber;
    private String pickupAddress;
    private String status;

    public BookingResponseDTO() {}

    public BookingResponseDTO(Long id, String from, String to, String date, String vehicle,
                            Double amount, String fullName, String license,
                            String phoneNumber, String pickupAddress, String status) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.date = date;
        this.vehicle = vehicle;
        this.amount = amount;
        this.fullName = fullName;
        this.license = license;
        this.phoneNumber = phoneNumber;
        this.pickupAddress = pickupAddress;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

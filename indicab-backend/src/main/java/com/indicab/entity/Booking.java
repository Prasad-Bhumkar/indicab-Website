package com.indicab.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_location")
    private String from;

    @Column(name = "to_location")
    private String to;

    private String date;

    private String vehicle;

    private Double amount;

    @Column(name = "full_name")
    private String fullName;

    private String license;

    private String name;

    @Column(name = "payment_method")
    private String paymentMethod;

    private String phone;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "pickup_address")
    private String pickupAddress;

    private String status;

    public Booking() {}

    public Booking(String from, String to, String date, String vehicle, Double amount, String fullName, String license, String name, String paymentMethod, String phone, String phoneNumber, String pickupAddress, String status) {
        this.from = from;
        this.to = to;
        this.date = date;
        this.vehicle = vehicle;
        this.amount = amount;
        this.fullName = fullName;
        this.license = license;
        this.name = name;
        this.paymentMethod = paymentMethod;
        this.phone = phone;
        this.phoneNumber = phoneNumber;
        this.pickupAddress = pickupAddress;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

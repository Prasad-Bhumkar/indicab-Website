package com.indicab.dto;

import jakarta.validation.constraints.*;

/**
 * DTO for payment request with Stripe
 */
public class PaymentRequestDTO {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;
    
    @NotBlank(message = "Currency is required")
    private String currency = "INR";
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // "card", "upi", "wallet"
    
    private String stripeToken; // Token from Stripe.js on frontend
    
    private String description; // Payment description

    public PaymentRequestDTO() {}

    public PaymentRequestDTO(Long bookingId, Double amount, String currency, String paymentMethod) {
        this.bookingId = bookingId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStripeToken() { return stripeToken; }
    public void setStripeToken(String stripeToken) { this.stripeToken = stripeToken; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

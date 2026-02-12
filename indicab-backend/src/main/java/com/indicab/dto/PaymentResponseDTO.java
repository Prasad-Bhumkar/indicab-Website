package com.indicab.dto;

/**
 * DTO for payment response
 */
public class PaymentResponseDTO {

    private String paymentId;
    private String clientSecret; // For Stripe client-side confirmation
    private String status; // SUCCEEDED, PENDING, FAILED
    private Long bookingId;
    private Double amount;
    private String currency;
    private String paymentMethod;
    private String message;
    private Long timestamp;

    public PaymentResponseDTO() {}

    public PaymentResponseDTO(String paymentId, String status, Long bookingId, Double amount,
                            String currency, String paymentMethod, String message) {
        this.paymentId = paymentId;
        this.status = status;
        this.bookingId = bookingId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public PaymentResponseDTO(String paymentId, String clientSecret, String status, Long bookingId,
                            Double amount, String currency, String paymentMethod, String message) {
        this.paymentId = paymentId;
        this.clientSecret = clientSecret;
        this.status = status;
        this.bookingId = bookingId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
}

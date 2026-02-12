package com.indicab.dto;

/**
 * DTO for Razorpay order response
 * Contains order details needed for frontend payment processing
 */
public class RazorpayOrderDTO {
    private String orderId;
    private Long bookingId;
    private Double amount;
    private String currency;
    private String paymentMethod;
    private String razorpayKeyId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String message;

    public RazorpayOrderDTO() {}

    public RazorpayOrderDTO(String orderId, Long bookingId, Double amount, String currency,
                           String paymentMethod, String razorpayKeyId, String customerName,
                           String customerEmail, String customerPhone, String message) {
        this.orderId = orderId;
        this.bookingId = bookingId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.razorpayKeyId = razorpayKeyId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.message = message;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

package com.indicab.service;

import com.indicab.dto.RazorpayOrderDTO;
import com.indicab.dto.RazorpayPaymentVerificationDTO;

/**
 * Service interface for Razorpay payment processing
 * Handles UPI, cards, net banking, and wallet payments
 */
public interface RazorpayService {
    
    /**
     * Create a Razorpay order for payment processing
     */
    RazorpayOrderDTO createOrder(Long bookingId, Double amount, String currency, String paymentMethod);
    
    /**
     * Verify Razorpay payment signature and complete payment
     */
    boolean verifyPaymentSignature(RazorpayPaymentVerificationDTO verificationDTO);
    
    /**
     * Get payment details from Razorpay
     */
    Object getPaymentDetails(String paymentId);
    
    /**
     * Refund a payment
     */
    boolean refundPayment(String paymentId, Double amount);
}

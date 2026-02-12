package com.indicab.service;

import com.indicab.dto.PaymentRequestDTO;
import com.indicab.dto.PaymentResponseDTO;
import com.indicab.entity.Payment;

import java.util.Optional;
import java.util.List;

/**
 * Service interface for payment-related operations
 */
public interface PaymentService {
    
    /**
     * Initiate a payment through Stripe
     */
    PaymentResponseDTO initiatePayment(PaymentRequestDTO paymentRequest);
    
    /**
     * Get payment by ID
     */
    Optional<Payment> getPaymentById(Long id);
    
    /**
     * Get payment by Stripe payment ID
     */
    Optional<Payment> getPaymentByStripeId(String stripePaymentId);
    
    /**
     * Get all payments for a booking
     */
    List<Payment> getPaymentsByBooking(Long bookingId);
    
    /**
     * Update payment status after webhook
     */
    Payment updatePaymentStatus(String stripePaymentId, String status, String failureReason);
    
    /**
     * Create Stripe payment intent (can be called from frontend SDK too)
     */
    String createPaymentIntent(Double amount, String currency);
}

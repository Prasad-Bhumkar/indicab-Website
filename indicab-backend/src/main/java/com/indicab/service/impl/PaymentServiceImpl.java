package com.indicab.service.impl;

import com.indicab.dto.PaymentRequestDTO;
import com.indicab.dto.PaymentResponseDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.Payment;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.PaymentRepository;
import com.indicab.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;

/**
 * Implementation of PaymentService
 * Integrates with Stripe for payment processing
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Override
    public PaymentResponseDTO initiatePayment(PaymentRequestDTO paymentRequest) {
        logger.info("Initiating payment for booking ID: {}, Amount: {}",
                   paymentRequest.getBookingId(), paymentRequest.getAmount());

        // Validate booking exists
        Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        try {
            // Initialize Stripe API key
            if (stripeApiKey != null && !stripeApiKey.isEmpty()) {
                Stripe.apiKey = stripeApiKey;
            }

            // Create Stripe PaymentIntent
            Map<String, Object> params = new HashMap<>();
            params.put("amount", (long) (paymentRequest.getAmount() * 100)); // Stripe uses cents
            params.put("currency", paymentRequest.getCurrency().toLowerCase());
            params.put("payment_method_types", java.util.Arrays.asList("card"));
            params.put("metadata", new HashMap<String, Object>() {{
                put("booking_id", paymentRequest.getBookingId().toString());
                put("user_email", booking.getUser().getEmail());
            }});

            PaymentIntent intent = PaymentIntent.create(params);

            // Create payment record
            Payment payment = new Payment(
                    intent.getId(),
                    booking,
                    paymentRequest.getAmount(),
                    paymentRequest.getCurrency(),
                    paymentRequest.getPaymentMethod()
            );
            payment.setStatus(intent.getStatus());

            Payment savedPayment = paymentRepository.save(payment);
            logger.info("Payment initiated with ID: {}, Stripe Intent: {}, Status: {}",
                       savedPayment.getId(), intent.getId(), intent.getStatus());

            return new PaymentResponseDTO(
                    intent.getId(),
                    intent.getClientSecret(),
                    intent.getStatus(),
                    booking.getId(),
                    paymentRequest.getAmount(),
                    paymentRequest.getCurrency(),
                    paymentRequest.getPaymentMethod(),
                    "Payment intent created successfully"
            );
        } catch (Exception e) {
            logger.error("Failed to create Stripe payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }
    
    @Override
    public Optional<Payment> getPaymentById(Long id) {
        logger.debug("Fetching payment with ID: {}", id);
        return paymentRepository.findById(id);
    }
    
    @Override
    public Optional<Payment> getPaymentByStripeId(String stripePaymentId) {
        logger.debug("Fetching payment with Stripe ID: {}", stripePaymentId);
        return paymentRepository.findByStripePaymentId(stripePaymentId);
    }
    
    @Override
    public List<Payment> getPaymentsByBooking(Long bookingId) {
        logger.debug("Fetching payments for booking ID: {}", bookingId);
        return paymentRepository.findByBookingId(bookingId, PageRequest.of(0, 10)).getContent();
    }
    
    @Override
    public Payment updatePaymentStatus(String stripePaymentId, String status, String failureReason) {
        logger.info("Updating payment status - Stripe ID: {}, Status: {}", stripePaymentId, status);
        
        Payment payment = paymentRepository.findByStripePaymentId(stripePaymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        payment.setStatus(status);
        if (failureReason != null) {
            payment.setFailureReason(failureReason);
        }
        
        Payment updatedPayment = paymentRepository.save(payment);
        
        // Update booking status if payment succeeded
        if ("SUCCEEDED".equals(status)) {
            Booking booking = payment.getBooking();
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);
            logger.info("Booking status updated to CONFIRMED - Booking ID: {}", booking.getId());
        }
        
        logger.info("Payment status updated - Payment ID: {}, New Status: {}", payment.getId(), status);
        return updatedPayment;
    }
    
    @Override
    public String createPaymentIntent(Double amount, String currency) {
        logger.info("Creating payment intent - Amount: {}, Currency: {}", amount, currency);

        try {
            // Initialize Stripe API key
            if (stripeApiKey != null && !stripeApiKey.isEmpty()) {
                Stripe.apiKey = stripeApiKey;
            }

            // Create Stripe PaymentIntent
            Map<String, Object> params = new HashMap<>();
            params.put("amount", (long) (amount * 100)); // Stripe uses cents
            params.put("currency", currency.toLowerCase());
            params.put("payment_method_types", java.util.Arrays.asList("card"));

            PaymentIntent intent = PaymentIntent.create(params);
            logger.info("Payment intent created: {}", intent.getId());
            return intent.getId();
        } catch (Exception e) {
            logger.error("Failed to create payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }
}

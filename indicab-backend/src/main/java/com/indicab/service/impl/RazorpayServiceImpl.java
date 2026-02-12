package com.indicab.service.impl;

import com.indicab.dto.RazorpayOrderDTO;
import com.indicab.dto.RazorpayPaymentVerificationDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.repository.BookingRepository;
import com.indicab.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Implementation of RazorpayService
 * Integrates with Razorpay for Indian payment processing (UPI, Cards, Net Banking, etc.)
 */
@Service
public class RazorpayServiceImpl implements RazorpayService {
    
    private static final Logger logger = LoggerFactory.getLogger(RazorpayServiceImpl.class);
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;
    
    @Override
    public RazorpayOrderDTO createOrder(Long bookingId, Double amount, String currency, String paymentMethod) {
        logger.info("Creating Razorpay order - Booking ID: {}, Amount: {}, Currency: {}, Payment Method: {}",
                   bookingId, amount, currency, paymentMethod);
        
        try {
            // Fetch booking and user details
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));
            
            User user = booking.getUser();
            
            // Initialize Razorpay client
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            
            // Create order JSON
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (long) (amount * 100)); // Razorpay uses paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "booking_" + bookingId);
            
            // Add metadata for reference
            JSONObject notes = new JSONObject();
            notes.put("booking_id", bookingId);
            notes.put("user_email", user.getEmail());
            notes.put("user_phone", user.getPhone());
            notes.put("payment_method", paymentMethod);
            orderRequest.put("notes", notes);
            
            // Create order
            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");
            
            logger.info("Razorpay order created successfully - Order ID: {}, Booking ID: {}",
                       orderId, bookingId);
            
            return new RazorpayOrderDTO(
                    orderId,
                    bookingId,
                    amount,
                    currency,
                    paymentMethod,
                    razorpayKeyId,
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    "Order created successfully. Ready for payment."
            );
        } catch (Exception e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }
    
    @Override
    public boolean verifyPaymentSignature(RazorpayPaymentVerificationDTO verificationDTO) {
        logger.info("Verifying Razorpay payment signature - Order ID: {}, Payment ID: {}",
                   verificationDTO.getOrderId(), verificationDTO.getPaymentId());
        
        try {
            String orderId = verificationDTO.getOrderId();
            String paymentId = verificationDTO.getPaymentId();
            String signature = verificationDTO.getSignature();
            
            // Create the message to verify: order_id|payment_id
            String verifyString = orderId + "|" + paymentId;
            
            // Generate HMAC SHA256 signature
            String generatedSignature = generateSignature(verifyString, razorpayKeySecret);
            
            boolean isValid = generatedSignature.equals(signature);
            
            if (isValid) {
                logger.info("Payment signature verified successfully - Payment ID: {}", paymentId);
            } else {
                logger.warn("Payment signature verification failed - Payment ID: {}", paymentId);
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("Error during signature verification: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public Object getPaymentDetails(String paymentId) {
        logger.debug("Fetching payment details - Payment ID: {}", paymentId);
        
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Payment payment = razorpay.payments.fetch(paymentId);
            
            logger.debug("Payment details fetched successfully - Payment ID: {}", paymentId);
            return payment;
        } catch (Exception e) {
            logger.error("Failed to fetch payment details: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch payment details: " + e.getMessage());
        }
    }
    
    @Override
    public boolean refundPayment(String paymentId, Double amount) {
        logger.info("Processing refund - Payment ID: {}, Amount: {}", paymentId, amount);
        
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", (long) (amount * 100)); // Razorpay uses paise
            
            razorpay.payments.refund(paymentId, refundRequest);
            
            logger.info("Refund processed successfully - Payment ID: {}", paymentId);
            return true;
        } catch (Exception e) {
            logger.error("Failed to process refund: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Generate HMAC SHA256 signature for payment verification
     */
    private String generateSignature(String message, String secret) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        
        byte[] hash = sha256_HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}

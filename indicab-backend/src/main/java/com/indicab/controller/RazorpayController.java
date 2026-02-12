package com.indicab.controller;

import com.indicab.dto.RazorpayOrderDTO;
import com.indicab.dto.RazorpayPaymentVerificationDTO;
import com.indicab.service.RazorpayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Razorpay payment controller
 * Handles payment processing for Indian payment methods (UPI, Cards, Net Banking, Wallets)
 */
@RestController
@RequestMapping("/api/razorpay")
@Tag(name = "Razorpay Payments", description = "Indian payment processing (UPI, Cards, Net Banking, Wallets)")
@SecurityRequirement(name = "Bearer Token")
public class RazorpayController {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayController.class);

    @Autowired
    private RazorpayService razorpayService;

    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order", description = "Create a payment order for Indian payment methods")
    public ResponseEntity<RazorpayOrderDTO> createOrder(
            @RequestParam Long bookingId,
            @RequestParam Double amount,
            @RequestParam(defaultValue = "INR") String currency,
            @RequestParam(defaultValue = "upi") String paymentMethod) {
        logger.info("Creating Razorpay order - Booking ID: {}, Amount: {}, Method: {}",
                   bookingId, amount, paymentMethod);
        try {
            RazorpayOrderDTO order = razorpayService.createOrder(bookingId, amount, currency, paymentMethod);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            logger.error("Booking not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Failed to create order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify payment signature", description = "Verify Razorpay payment and complete transaction")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody RazorpayPaymentVerificationDTO verificationDTO) {
        logger.info("Verifying payment - Order ID: {}, Payment ID: {}",
                   verificationDTO.getOrderId(), verificationDTO.getPaymentId());
        try {
            boolean isValid = razorpayService.verifyPaymentSignature(verificationDTO);
            
            if (isValid) {
                return ResponseEntity.ok(new PaymentVerificationResponse(
                        true,
                        "Payment verified successfully",
                        verificationDTO.getPaymentId()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new PaymentVerificationResponse(false, "Invalid payment signature", null));
            }
        } catch (Exception e) {
            logger.error("Error during payment verification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PaymentVerificationResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/payment/{paymentId}")
    @Operation(summary = "Get payment details", description = "Fetch payment details from Razorpay")
    public ResponseEntity<?> getPaymentDetails(@PathVariable String paymentId) {
        logger.debug("Fetching payment details - Payment ID: {}", paymentId);
        try {
            Object paymentDetails = razorpayService.getPaymentDetails(paymentId);
            return ResponseEntity.ok(paymentDetails);
        } catch (Exception e) {
            logger.error("Failed to fetch payment details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Payment not found", e.getMessage()));
        }
    }

    @PostMapping("/refund")
    @Operation(summary = "Refund payment", description = "Process refund for a payment")
    public ResponseEntity<?> refundPayment(
            @RequestParam String paymentId,
            @RequestParam Double amount) {
        logger.info("Processing refund - Payment ID: {}, Amount: {}", paymentId, amount);
        try {
            boolean success = razorpayService.refundPayment(paymentId, amount);
            
            if (success) {
                return ResponseEntity.ok(new RefundResponse(
                        true,
                        "Refund processed successfully",
                        paymentId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RefundResponse(false, "Failed to process refund", paymentId));
            }
        } catch (Exception e) {
            logger.error("Error during refund: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new RefundResponse(false, e.getMessage(), paymentId));
        }
    }

    /**
     * Response class for payment verification
     */
    public static class PaymentVerificationResponse {
        private boolean success;
        private String message;
        private String paymentId;

        public PaymentVerificationResponse(boolean success, String message, String paymentId) {
            this.success = success;
            this.message = message;
            this.paymentId = paymentId;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getPaymentId() { return paymentId; }
    }

    /**
     * Response class for refund
     */
    public static class RefundResponse {
        private boolean success;
        private String message;
        private String paymentId;

        public RefundResponse(boolean success, String message, String paymentId) {
            this.success = success;
            this.message = message;
            this.paymentId = paymentId;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getPaymentId() { return paymentId; }
    }

    /**
     * Generic error response
     */
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() { return error; }
        public String getMessage() { return message; }
    }
}

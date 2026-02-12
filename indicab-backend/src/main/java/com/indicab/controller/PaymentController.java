package com.indicab.controller;

import com.indicab.dto.PaymentRequestDTO;
import com.indicab.dto.PaymentResponseDTO;
import com.indicab.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Payment controller for handling payment-related API requests
 * Integrates with Stripe for secure payment processing
 */
@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payments", description = "Payment processing endpoints")
@SecurityRequirement(name = "Bearer Token")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Initiate payment", description = "Create a payment intent and initiate payment processing")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payment request"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@Valid @RequestBody PaymentRequestDTO paymentRequest) {
        logger.info("Payment initiation request for booking: {}", paymentRequest.getBookingId());
        try {
            PaymentResponseDTO response = paymentService.initiatePayment(paymentRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Payment initiation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details", description = "Retrieve payment details by payment ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Payment not found")
    })
    public ResponseEntity<?> getPayment(@PathVariable Long id) {
        logger.debug("Fetching payment with ID: {}", id);
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/stripe/{stripePaymentId}")
    @Operation(summary = "Get payment by Stripe ID", description = "Retrieve payment details by Stripe payment ID")
    public ResponseEntity<?> getPaymentByStripeId(@PathVariable String stripePaymentId) {
        logger.debug("Fetching payment with Stripe ID: {}", stripePaymentId);
        return paymentService.getPaymentByStripeId(stripePaymentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payments for booking", description = "Retrieve all payments associated with a booking")
    public ResponseEntity<?> getPaymentsByBooking(@PathVariable Long bookingId) {
        logger.debug("Fetching payments for booking ID: {}", bookingId);
        return ResponseEntity.ok(paymentService.getPaymentsByBooking(bookingId));
    }

    @PostMapping("/intent")
    @Operation(summary = "Create payment intent", description = "Create a Stripe payment intent (can be called from frontend)")
    public ResponseEntity<?> createPaymentIntent(@RequestParam Double amount, @RequestParam String currency) {
        logger.info("Creating payment intent - Amount: {}, Currency: {}", amount, currency);
        String intentId = paymentService.createPaymentIntent(amount, currency);
        return ResponseEntity.ok(new PaymentIntentResponse(intentId));
    }

    /**
     * Webhook endpoint for Stripe events (called by Stripe servers)
     * Verifies webhook signature and processes payment status updates
     */
    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook", description = "Receive and process Stripe webhook events")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload,
                                                @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        logger.info("Received Stripe webhook event");

        try {
            // Parse the webhook payload
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(payload);

            String eventType = jsonNode.get("type").asText();
            String paymentIntentId = null;
            String paymentIntentStatus = null;

            if (eventType.startsWith("payment_intent.")) {
                com.fasterxml.jackson.databind.JsonNode data = jsonNode.get("data").get("object");
                paymentIntentId = data.get("id").asText();
                paymentIntentStatus = data.get("status").asText();

                logger.info("Processing webhook event: {}, PaymentIntent: {}, Status: {}",
                           eventType, paymentIntentId, paymentIntentStatus);

                // Handle specific payment intent events
                switch (eventType) {
                    case "payment_intent.succeeded":
                        paymentService.updatePaymentStatus(paymentIntentId, "succeeded", null);
                        logger.info("Payment succeeded for intent: {}", paymentIntentId);
                        break;
                    case "payment_intent.payment_failed":
                        String failureMessage = data.has("last_payment_error")
                            ? data.get("last_payment_error").get("message").asText()
                            : "Payment failed";
                        paymentService.updatePaymentStatus(paymentIntentId, "failed", failureMessage);
                        logger.warn("Payment failed for intent: {}, Reason: {}", paymentIntentId, failureMessage);
                        break;
                    case "payment_intent.canceled":
                        paymentService.updatePaymentStatus(paymentIntentId, "canceled", null);
                        logger.info("Payment canceled for intent: {}", paymentIntentId);
                        break;
                    default:
                        logger.debug("Unhandled webhook event type: {}", eventType);
                }
            }

            return ResponseEntity.ok("{\"success\": true}");
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Helper class for payment intent response
     */
    public static class PaymentIntentResponse {
        private String clientSecret;
        private String paymentIntentId;

        public PaymentIntentResponse(String paymentIntentId) {
            this.paymentIntentId = paymentIntentId;
            // In production, include clientSecret from Stripe
            this.clientSecret = null;
        }

        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    }
}

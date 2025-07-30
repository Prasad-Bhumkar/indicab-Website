package com.indicab.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @PostMapping
    public ResponseEntity<?> initiatePayment(@RequestBody Object paymentData) {
        // Integrate with payment gateway here
        return ResponseEntity.ok("Payment initiated (mock)");
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String id) {
        // Return payment status (mock)
        return ResponseEntity.ok("Payment status for id: " + id);
    }
}

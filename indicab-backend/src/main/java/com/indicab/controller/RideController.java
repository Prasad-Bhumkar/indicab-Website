package com.indicab.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/ride")
public class RideController {
    @GetMapping("/track/{id}")
    public ResponseEntity<?> trackRide(@PathVariable String id) {
        // Implement ride tracking logic here
        return ResponseEntity.ok("Tracking info for ride id: " + id);
    }
}

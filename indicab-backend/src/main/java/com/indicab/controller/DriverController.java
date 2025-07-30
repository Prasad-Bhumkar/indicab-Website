package com.indicab.controller;

import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerDriver(@RequestBody User driver) {
        if (userRepository.findByEmail(driver.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        driver.setPassword(passwordEncoder.encode(driver.getPassword()));
        driver.setRole("DRIVER");
        userRepository.save(driver);
        return ResponseEntity.ok("Driver registration successful");
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllDrivers() {
        List<User> drivers = userRepository.findAll().stream()
            .filter(u -> "DRIVER".equals(u.getRole()))
            .toList();
        return ResponseEntity.ok(drivers);
    }
}

package com.indicab.controller;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/driver")
@Tag(name = "Driver Management", description = "Driver registration and approval endpoints")
@SecurityRequirement(name = "Bearer Token")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @PostMapping("/apply")
    @Operation(summary = "Apply for driver status", description = "User applies to become a driver with license and vehicle details")
    public ResponseEntity<DriverResponseDTO> applyAsDriver(
            @Valid @RequestBody DriverRegistrationDTO registrationDTO,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        DriverResponseDTO response = driverService.applyAsDriver(userId, registrationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending driver applications", description = "Admin only - Get all drivers with PENDING approval status")
    public ResponseEntity<List<DriverResponseDTO>> getPendingApplications() {
        List<DriverResponseDTO> applications = driverService.getPendingApplications();
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/approved")
    @Operation(summary = "Get approved drivers", description = "Get all drivers with APPROVED status")
    public ResponseEntity<List<DriverResponseDTO>> getApprovedDrivers() {
        List<DriverResponseDTO> drivers = driverService.getApprovedDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all drivers", description = "Get all drivers across all statuses")
    public ResponseEntity<List<DriverResponseDTO>> getAllDrivers() {
        List<DriverResponseDTO> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{driverId}")
    @Operation(summary = "Get driver details", description = "Get details of a specific driver by ID")
    public ResponseEntity<DriverResponseDTO> getDriverById(@PathVariable Long driverId) {
        DriverResponseDTO driver = driverService.getDriverById(driverId);
        return ResponseEntity.ok(driver);
    }

    @PostMapping("/review-application")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Review driver application", description = "Admin only - Approve or reject a driver application")
    public ResponseEntity<DriverResponseDTO> reviewApplication(
            @Valid @RequestBody DriverApprovalDTO approvalDTO) {
        DriverResponseDTO result = driverService.reviewDriverApplication(approvalDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/rides")
    @Operation(summary = "Get driver's rides", description = "Get all rides assigned to the authenticated driver")
    public ResponseEntity<List<Object>> getDriverRides(Authentication authentication) {
        // In a real system, authentication.getName() would be used to find the driver ID or email
        // For now, using a placeholder driver ID from the context or a mock.
        // Assuming current user is a driver.
        return ResponseEntity.ok(List.of());
    }
}

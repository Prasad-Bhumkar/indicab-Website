package com.indicab.controller;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.service.impl.DriverServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin controller for managing drivers
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/drivers")
@Tag(name = "Admin - Drivers", description = "Admin driver management endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints require ADMIN role
public class AdminDriverController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminDriverController.class);
    
    @Autowired
    private DriverServiceImpl driverService;
    
    /**
     * Get all drivers with pagination and sorting
     */
    @GetMapping
    @Operation(summary = "Get all drivers", description = "Retrieve paginated list of all drivers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Drivers retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<Page<DriverResponseDTO>> getAllDrivers(Pageable pageable) {
        logger.info("Fetching all drivers with pagination - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<DriverResponseDTO> drivers = driverService.getAllDriversPaged(pageable);
        return ResponseEntity.ok(drivers);
    }
    
    /**
     * Get all pending driver applications with pagination and sorting
     */
    @GetMapping("/pending")
    @Operation(summary = "Get pending applications", description = "Retrieve paginated list of pending driver applications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending applications retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<Page<DriverResponseDTO>> getPendingApplications(Pageable pageable) {
        logger.info("Fetching pending driver applications with pagination");
        Page<DriverResponseDTO> pendingApplications = driverService.getPendingApplicationsPaged(pageable);
        return ResponseEntity.ok(pendingApplications);
    }
    
    /**
     * Get all approved drivers with pagination and sorting
     */
    @GetMapping("/approved")
    @Operation(summary = "Get approved drivers", description = "Retrieve paginated list of approved drivers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Approved drivers retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<Page<DriverResponseDTO>> getApprovedDrivers(Pageable pageable) {
        logger.info("Fetching approved drivers with pagination");
        Page<DriverResponseDTO> approvedDrivers = driverService.getApprovedDriversPaged(pageable);
        return ResponseEntity.ok(approvedDrivers);
    }
    
    /**
     * Get driver by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get driver details", description = "Retrieve detailed information about a specific driver")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Driver retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Driver not found"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<DriverResponseDTO> getDriverById(@PathVariable Long id) {
        logger.info("Fetching driver with ID: {}", id);
        try {
            DriverResponseDTO driver = driverService.getDriverById(id);
            return ResponseEntity.ok(driver);
        } catch (IllegalArgumentException e) {
            logger.error("Driver not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Approve or reject a driver application
     */
    @PutMapping("/{id}/review")
    @Operation(summary = "Review driver application", description = "Approve or reject a driver application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Driver application reviewed successfully"),
        @ApiResponse(responseCode = "404", description = "Driver not found"),
        @ApiResponse(responseCode = "400", description = "Invalid approval status"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<DriverResponseDTO> reviewDriverApplication(
            @PathVariable Long id,
            @Valid @RequestBody DriverApprovalDTO approvalDTO) {
        logger.info("Admin reviewing driver application for ID: {}, Status: {}", id, approvalDTO.getStatus());

        try {
            // Set the driver ID from path variable
            approvalDTO.setDriverId(id);
            DriverResponseDTO reviewedDriver = driverService.reviewDriverApplication(approvalDTO);
            logger.info("Driver application review completed for ID: {}", id);
            return ResponseEntity.ok(reviewedDriver);
        } catch (IllegalArgumentException e) {
            logger.error("Error reviewing driver application: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete multiple drivers
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete drivers", description = "Delete multiple drivers at once (ADMIN only)")
    @ApiResponse(responseCode = "204", description = "Drivers deleted successfully")
    public ResponseEntity<Void> bulkDeleteDrivers(@RequestBody java.util.List<Long> ids) {
        logger.info("Admin performing bulk delete on drivers. Count: {}", ids.size());
        driverService.bulkDeleteDrivers(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bulk update drivers status
     */
    @PutMapping("/bulk/status")
    @Operation(summary = "Bulk update driver status", description = "Update status for multiple drivers at once (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Drivers updated successfully")
    public ResponseEntity<Void> bulkUpdateDriversStatus(
            @RequestBody java.util.List<Long> ids,
            @RequestParam String status) {

        logger.info("Admin performing bulk status update to: {} for {} drivers", status, ids.size());
        driverService.bulkUpdateDriversStatus(ids, status);
        return ResponseEntity.ok().build();
    }
}

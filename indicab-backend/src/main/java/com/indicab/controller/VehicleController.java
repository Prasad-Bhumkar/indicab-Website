package com.indicab.controller;

import com.indicab.dto.VehicleDTO;
import com.indicab.entity.Vehicle;
import com.indicab.service.impl.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing vehicles
 */
@RestController
@RequestMapping("/api/v1/admin/vehicles")
@Tag(name = "Admin - Vehicles", description = "Vehicles management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class VehicleController {
    
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    
    @Autowired
    private VehicleService vehicleService;
    
    /**
     * Get all vehicles with pagination
     */
    @GetMapping
    @Operation(summary = "Get all vehicles", description = "Retrieve all vehicles with pagination")
    @ApiResponse(responseCode = "200", description = "Vehicles retrieved successfully")
    public ResponseEntity<Page<Vehicle>> getAllVehicles(Pageable pageable) {
        logger.info("Fetching all vehicles");
        Page<Vehicle> vehicles = vehicleService.getAllVehicles(pageable);
        return ResponseEntity.ok(vehicles);
    }
    
    /**
     * Get active vehicles only
     */
    @GetMapping("/active")
    @Operation(summary = "Get active vehicles", description = "Retrieve only active vehicles")
    @ApiResponse(responseCode = "200", description = "Active vehicles retrieved successfully")
    public ResponseEntity<Page<Vehicle>> getActiveVehicles(Pageable pageable) {
        logger.info("Fetching active vehicles");
        Page<Vehicle> vehicles = vehicleService.getActiveVehicles(pageable);
        return ResponseEntity.ok(vehicles);
    }
    
    /**
     * Get vehicle by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID", description = "Retrieve a specific vehicle by its ID")
    @ApiResponse(responseCode = "200", description = "Vehicle retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Vehicle not found")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        logger.info("Fetching vehicle with ID: {}", id);
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new vehicle
     */
    @PostMapping
    @Operation(summary = "Create vehicle", description = "Create a new vehicle")
    @ApiResponse(responseCode = "201", description = "Vehicle created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody VehicleDTO vehicleDTO) {
        logger.info("Creating new vehicle: {}", vehicleDTO.getName());
        
        try {
            Vehicle vehicle = vehicleService.createVehicle(vehicleDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
        } catch (Exception e) {
            logger.error("Error creating vehicle: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update a vehicle
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle", description = "Update an existing vehicle")
    @ApiResponse(responseCode = "200", description = "Vehicle updated successfully")
    @ApiResponse(responseCode = "404", description = "Vehicle not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDTO vehicleDTO) {
        
        logger.info("Updating vehicle with ID: {}", id);
        
        try {
            Vehicle vehicle = vehicleService.updateVehicle(id, vehicleDTO);
            return ResponseEntity.ok(vehicle);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating vehicle: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a vehicle
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vehicle", description = "Delete a vehicle by its ID")
    @ApiResponse(responseCode = "204", description = "Vehicle deleted successfully")
    @ApiResponse(responseCode = "404", description = "Vehicle not found")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        logger.info("Deleting vehicle with ID: {}", id);

        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting vehicle: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete multiple vehicles
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete vehicles", description = "Delete multiple vehicles at once (ADMIN only)")
    @ApiResponse(responseCode = "204", description = "Vehicles deleted successfully")
    public ResponseEntity<Void> bulkDeleteVehicles(@RequestBody java.util.List<Long> ids) {
        logger.info("Admin performing bulk delete on vehicles. Count: {}", ids.size());
        vehicleService.bulkDeleteVehicles(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bulk update vehicles status
     */
    @PutMapping("/bulk/status")
    @Operation(summary = "Bulk update vehicle status", description = "Update status for multiple vehicles at once (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Vehicles updated successfully")
    public ResponseEntity<Void> bulkUpdateVehiclesStatus(
            @RequestBody java.util.List<Long> ids,
            @RequestParam String status) {

        logger.info("Admin performing bulk status update to: {} for {} vehicles", status, ids.size());
        vehicleService.bulkUpdateVehiclesStatus(ids, status);
        return ResponseEntity.ok().build();
    }
}

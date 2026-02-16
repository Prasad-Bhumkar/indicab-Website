package com.indicab.controller;

import com.indicab.dto.CityDTO;
import com.indicab.entity.City;
import com.indicab.service.impl.CityService;
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
 * Controller for managing cities
 */
@RestController
@RequestMapping("/api/v1/cities")
@Tag(name = "Admin - Cities", description = "Cities management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class CityController {
    
    private static final Logger logger = LoggerFactory.getLogger(CityController.class);
    
    @Autowired
    private CityService cityService;
    
    /**
     * Get all cities with pagination
     */
    @GetMapping
    @Operation(summary = "Get all cities", description = "Retrieve all cities with pagination")
    @ApiResponse(responseCode = "200", description = "Cities retrieved successfully")
    public ResponseEntity<Page<City>> getAllCities(Pageable pageable) {
        logger.info("Fetching all cities");
        Page<City> cities = cityService.getAllCities(pageable);
        return ResponseEntity.ok(cities);
    }
    
    /**
     * Get active cities only
     */
    @GetMapping("/active")
    @Operation(summary = "Get active cities", description = "Retrieve only active cities")
    @ApiResponse(responseCode = "200", description = "Active cities retrieved successfully")
    public ResponseEntity<Page<City>> getActiveCities(Pageable pageable) {
        logger.info("Fetching active cities");
        Page<City> cities = cityService.getActiveCities(pageable);
        return ResponseEntity.ok(cities);
    }
    
    /**
     * Get city by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get city by ID", description = "Retrieve a specific city by its ID")
    @ApiResponse(responseCode = "200", description = "City retrieved successfully")
    @ApiResponse(responseCode = "404", description = "City not found")
    public ResponseEntity<City> getCityById(@PathVariable Long id) {
        logger.info("Fetching city with ID: {}", id);
        return cityService.getCityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new city
     */
    @PostMapping
    @Operation(summary = "Create city", description = "Create a new city")
    @ApiResponse(responseCode = "201", description = "City created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<City> createCity(@Valid @RequestBody CityDTO cityDTO) {
        logger.info("Creating new city: {}", cityDTO.getName());
        
        try {
            City city = cityService.createCity(cityDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(city);
        } catch (IllegalArgumentException e) {
            logger.error("Error creating city: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update a city
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update city", description = "Update an existing city")
    @ApiResponse(responseCode = "200", description = "City updated successfully")
    @ApiResponse(responseCode = "404", description = "City not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<City> updateCity(
            @PathVariable Long id,
            @Valid @RequestBody CityDTO cityDTO) {
        
        logger.info("Updating city with ID: {}", id);
        
        try {
            City city = cityService.updateCity(id, cityDTO);
            return ResponseEntity.ok(city);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating city: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete a city
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete city", description = "Delete a city by its ID")
    @ApiResponse(responseCode = "204", description = "City deleted successfully")
    @ApiResponse(responseCode = "404", description = "City not found")
    public ResponseEntity<Void> deleteCity(@PathVariable Long id) {
        logger.info("Deleting city with ID: {}", id);
        
        try {
            cityService.deleteCity(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting city: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

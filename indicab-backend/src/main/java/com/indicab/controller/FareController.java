package com.indicab.controller;

import com.indicab.dto.FareCalculationDTO;
import com.indicab.service.impl.FareCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for fare calculation and estimation endpoints
 */
@RestController
@RequestMapping("/api/v1/fares")
@Tag(name = "Fares", description = "Fare calculation and estimation endpoints")
public class FareController {
    
    private static final Logger logger = LoggerFactory.getLogger(FareController.class);
    
    @Autowired
    private FareCalculationService fareCalculationService;
    
    /**
     * Calculate estimated fare for a booking
     * 
     * @param fromCity Starting city
     * @param toCity Destination city
     * @param vehicleType Vehicle type (SEDAN, SUV, LUXURY, etc.)
     * @param distance Distance in kilometers
     * @return FareCalculationDTO with fare breakdown
     */
    @GetMapping("/calculate")
    @Operation(summary = "Calculate estimated fare",
               description = "Calculate estimated fare based on distance, vehicle type, and popular routes")
    @ApiResponse(responseCode = "200", description = "Fare calculated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input parameters")
    public ResponseEntity<FareCalculationDTO> calculateFare(
            @RequestParam(name = "from") String fromCity,
            @RequestParam(name = "to") String toCity,
            @RequestParam(name = "vehicle") String vehicleType,
            @RequestParam(name = "distance") Double distance) {
        
        logger.info("Fare calculation request: from={}, to={}, vehicle={}, distance={}",
                   fromCity, toCity, vehicleType, distance);
        
        try {
            FareCalculationDTO fare = fareCalculationService.calculateFare(fromCity, toCity, vehicleType, distance);
            logger.info("Fare calculated successfully: {}", fare.getTotalFare());
            return ResponseEntity.ok(fare);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid fare calculation parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get available vehicle types and their price multipliers
     * 
     * @return Map of vehicle types and multipliers
     */
    @GetMapping("/vehicles")
    @Operation(summary = "Get vehicle types",
               description = "Get available vehicle types and their price multipliers")
    @ApiResponse(responseCode = "200", description = "Vehicle types retrieved successfully")
    public ResponseEntity<Map<String, Double>> getVehicleTypes() {
        logger.info("Retrieving available vehicle types");
        Map<String, Double> vehicles = fareCalculationService.getVehicleMultipliers();
        return ResponseEntity.ok(vehicles);
    }
    
    /**
     * Get pricing configuration
     * 
     * @return Pricing configuration (base fare, price per km, percentages)
     */
    @GetMapping("/config")
    @Operation(summary = "Get pricing configuration",
               description = "Get current fare calculation pricing configuration")
    @ApiResponse(responseCode = "200", description = "Pricing config retrieved successfully")
    public ResponseEntity<Map<String, Double>> getPricingConfig() {
        logger.info("Retrieving pricing configuration");
        Map<String, Double> config = fareCalculationService.getPricingConfig();
        return ResponseEntity.ok(config);
    }
}

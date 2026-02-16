package com.indicab.service.impl;

import com.indicab.dto.FareCalculationDTO;
import com.indicab.entity.Route;
import com.indicab.repository.RouteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service for calculating estimated fares based on distance, vehicle type, and popular routes
 */
@Service
public class FareCalculationService {
    
    private static final Logger logger = LoggerFactory.getLogger(FareCalculationService.class);
    
    @Autowired
    private RouteRepository routeRepository;
    
    // Pricing configuration
    private static final Double BASE_FARE = 50.0; // Base fare in rupees
    private static final Double PRICE_PER_KM = 15.0; // Per kilometer charge
    private static final Double SERVICE_FEE_PERCENTAGE = 0.10; // 10% service fee
    private static final Double TAX_PERCENTAGE = 0.05; // 5% tax
    
    // Vehicle type multipliers
    private static final Map<String, Double> VEHICLE_MULTIPLIERS = new HashMap<>();
    
    static {
        VEHICLE_MULTIPLIERS.put("SEDAN", 1.0);
        VEHICLE_MULTIPLIERS.put("SUV", 1.5);
        VEHICLE_MULTIPLIERS.put("LUXURY", 2.0);
        VEHICLE_MULTIPLIERS.put("ECONOMY", 0.8);
        VEHICLE_MULTIPLIERS.put("PREMIUM", 1.8);
        VEHICLE_MULTIPLIERS.put("XL", 2.5);
    }
    
    /**
     * Calculate fare based on distance, vehicle type, and popular routes
     * 
     * @param fromCity Starting city
     * @param toCity Destination city
     * @param vehicleType Type of vehicle (SEDAN, SUV, LUXURY, etc.)
     * @param distance Distance in kilometers
     * @return FareCalculationDTO with breakdown
     */
    public FareCalculationDTO calculateFare(String fromCity, String toCity, String vehicleType, Double distance) {
        logger.info("Calculating fare: from {} to {} using {} vehicle, distance: {} km",
                   fromCity, toCity, vehicleType, distance);
        
        // Validate inputs
        if (distance == null || distance <= 0) {
            throw new IllegalArgumentException("Distance must be greater than 0");
        }
        
        if (vehicleType == null || vehicleType.isEmpty()) {
            throw new IllegalArgumentException("Vehicle type is required");
        }
        
        // Get vehicle multiplier
        Double multiplier = VEHICLE_MULTIPLIERS.getOrDefault(vehicleType.toUpperCase(), 1.0);
        
        // Check for popular route first
        Optional<Route> popularRoute = routeRepository.findByFromAndToCity(fromCity, toCity);
        
        FareCalculationDTO fareDTO = new FareCalculationDTO();
        fareDTO.setFromCity(fromCity);
        fareDTO.setToCity(toCity);
        fareDTO.setVehicleType(vehicleType);
        fareDTO.setDistance(distance);
        fareDTO.setVehicleMultiplier(multiplier);
        
        if (popularRoute.isPresent() && popularRoute.get().getIsPopular()) {
            // Use popular route fixed price
            Route route = popularRoute.get();
            double baseFare = route.getFixedPrice();
            fareDTO.setBaseFare(baseFare);
            fareDTO.setDistanceCharge(0.0);
            fareDTO.setIsPopularRoute(true);
            fareDTO.setCalculationType("POPULAR_ROUTE");
            
            double serviceFee = baseFare * SERVICE_FEE_PERCENTAGE;
            double taxes = baseFare * TAX_PERCENTAGE;
            double totalFare = baseFare + serviceFee + taxes;
            
            fareDTO.setServiceFee(serviceFee);
            fareDTO.setTaxes(taxes);
            fareDTO.setTotalFare(totalFare);
            
            logger.info("Using popular route fare: {}", totalFare);
        } else {
            // Distance-based calculation
            double baseFare = BASE_FARE;
            double distanceCharge = distance * PRICE_PER_KM * multiplier;
            double subtotal = baseFare + distanceCharge;
            double serviceFee = subtotal * SERVICE_FEE_PERCENTAGE;
            double taxes = subtotal * TAX_PERCENTAGE;
            double totalFare = subtotal + serviceFee + taxes;
            
            fareDTO.setBaseFare(baseFare);
            fareDTO.setDistanceCharge(distanceCharge);
            fareDTO.setIsPopularRoute(false);
            fareDTO.setCalculationType("DISTANCE_BASED");
            fareDTO.setServiceFee(serviceFee);
            fareDTO.setTaxes(taxes);
            fareDTO.setTotalFare(totalFare);
            
            logger.info("Using distance-based fare: {} (base: {}, distance: {}, service fee: {}, taxes: {})",
                       totalFare, baseFare, distanceCharge, serviceFee, taxes);
        }
        
        return fareDTO;
    }
    
    /**
     * Get available vehicle types and their multipliers
     */
    public Map<String, Double> getVehicleMultipliers() {
        return new HashMap<>(VEHICLE_MULTIPLIERS);
    }
    
    /**
     * Get pricing configuration
     */
    public Map<String, Double> getPricingConfig() {
        Map<String, Double> config = new HashMap<>();
        config.put("baseFare", BASE_FARE);
        config.put("pricePerKm", PRICE_PER_KM);
        config.put("serviceFeePercentage", SERVICE_FEE_PERCENTAGE);
        config.put("taxPercentage", TAX_PERCENTAGE);
        return config;
    }
}

package com.indicab.service.impl;

import com.indicab.dto.VehicleDTO;
import com.indicab.entity.Vehicle;
import com.indicab.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing vehicles
 */
@Service
public class VehicleService {
    
    private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    /**
     * Create a new vehicle
     */
    public Vehicle createVehicle(VehicleDTO vehicleDTO) {
        logger.info("Creating new vehicle: {}", vehicleDTO.getName());
        
        Vehicle vehicle = new Vehicle(
            vehicleDTO.getName(),
            vehicleDTO.getType(),
            vehicleDTO.getSeatCapacity(),
            vehicleDTO.getPriceMultiplier(),
            vehicleDTO.getImageUrl(),
            vehicleDTO.getIsActive()
        );
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        logger.info("Vehicle created successfully with ID: {}", savedVehicle.getId());
        return savedVehicle;
    }
    
    /**
     * Get vehicle by ID
     */
    public Optional<Vehicle> getVehicleById(Long id) {
        logger.debug("Fetching vehicle with ID: {}", id);
        return vehicleRepository.findById(id);
    }
    
    /**
     * Get vehicle by type
     */
    public Optional<Vehicle> getVehicleByType(String type) {
        logger.debug("Fetching vehicle with type: {}", type);
        return vehicleRepository.findByType(type);
    }
    
    /**
     * Get all vehicles with pagination
     */
    public Page<Vehicle> getAllVehicles(Pageable pageable) {
        logger.debug("Fetching all vehicles");
        return vehicleRepository.findAll(pageable);
    }
    
    /**
     * Get active vehicles only
     */
    public Page<Vehicle> getActiveVehicles(Pageable pageable) {
        logger.debug("Fetching active vehicles");
        return vehicleRepository.findByIsActive(true, pageable);
    }
    
    /**
     * Update a vehicle
     */
    public Vehicle updateVehicle(Long id, VehicleDTO vehicleDTO) {
        logger.info("Updating vehicle with ID: {}", id);
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + id));
        
        vehicle.setName(vehicleDTO.getName());
        vehicle.setType(vehicleDTO.getType());
        vehicle.setSeatCapacity(vehicleDTO.getSeatCapacity());
        vehicle.setPriceMultiplier(vehicleDTO.getPriceMultiplier());
        vehicle.setImageUrl(vehicleDTO.getImageUrl());
        vehicle.setIsActive(vehicleDTO.getIsActive());
        
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        logger.info("Vehicle updated successfully with ID: {}", id);
        return updatedVehicle;
    }
    
    /**
     * Delete a vehicle
     */
    public void deleteVehicle(Long id) {
        logger.info("Deleting vehicle with ID: {}", id);
        
        if (!vehicleRepository.existsById(id)) {
            throw new IllegalArgumentException("Vehicle not found with ID: " + id);
        }
        
        vehicleRepository.deleteById(id);
        logger.info("Vehicle deleted successfully with ID: {}", id);
    }
    
    /**
     * Check if vehicle exists
     */
    public boolean vehicleExists(Long id) {
        return vehicleRepository.existsById(id);
    }

    /**
     * Delete multiple vehicles by ID (admin only)
     */
    public void bulkDeleteVehicles(List<Long> ids) {
        logger.info("Bulk deleting {} vehicles", ids.size());
        try {
            vehicleRepository.deleteAllById(ids);
            logger.info("Bulk deletion completed for {} vehicle(s)", ids.size());
        } catch (Exception e) {
            logger.error("Failed to bulk delete vehicles", e);
            throw new RuntimeException("Failed to delete multiple vehicles");
        }
    }

    /**
     * Update active status for multiple vehicles (admin only).
     * status is interpreted as: "active"/"true"/"1" -> true, otherwise -> false
     */
    public void bulkUpdateVehiclesStatus(List<Long> ids, String status) {
        logger.info("Bulk updating vehicle status for {} vehicles to {}", ids.size(), status);
        Boolean isActive = "active".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status) || "1".equals(status);
        try {
            List<Vehicle> vehicles = vehicleRepository.findAllById(ids);
            for (Vehicle vehicle : vehicles) {
                vehicle.setIsActive(isActive);
            }
            vehicleRepository.saveAll(vehicles);
            logger.info("Bulk status update completed for {} vehicle(s)", ids.size());
        } catch (Exception e) {
            logger.error("Failed to bulk update vehicle status", e);
            throw new RuntimeException("Failed to update status for multiple vehicles");
        }
    }
}

package com.indicab.service;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.entity.User;

import java.util.List;

/**
 * Service interface for driver-related operations
 */
public interface DriverService {
    
    /**
     * Apply for driver status with license and vehicle details
     */
    DriverResponseDTO applyAsDriver(Long userId, DriverRegistrationDTO registrationDTO);
    
    /**
     * Get all pending driver applications
     */
    List<DriverResponseDTO> getPendingApplications();
    
    /**
     * Get all approved drivers
     */
    List<DriverResponseDTO> getApprovedDrivers();
    
    /**
     * Get all drivers (all statuses)
     */
    List<DriverResponseDTO> getAllDrivers();
    
    /**
     * Get driver by ID
     */
    DriverResponseDTO getDriverById(Long driverId);
    
    /**
     * Approve or reject a driver application (admin only)
     */
    DriverResponseDTO reviewDriverApplication(DriverApprovalDTO approvalDTO);
    
    /**
     * Get driver by User ID
     */
    User getDriverByUserId(Long userId);
}

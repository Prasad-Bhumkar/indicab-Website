package com.indicab.service;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
     * Get all pending driver applications with pagination
     */
    Page<DriverResponseDTO> getPendingApplicationsPaged(Pageable pageable);

    /**
     * Get all approved drivers
     */
    List<DriverResponseDTO> getApprovedDrivers();

    /**
     * Get all approved drivers with pagination
     */
    Page<DriverResponseDTO> getApprovedDriversPaged(Pageable pageable);

    /**
     * Get all drivers (all statuses)
     */
    List<DriverResponseDTO> getAllDrivers();

    /**
     * Get all drivers with pagination
     */
    Page<DriverResponseDTO> getAllDriversPaged(Pageable pageable);

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

    /**
     * Delete multiple drivers by user IDs (admin only)
     */
    void bulkDeleteDrivers(List<Long> ids);

    /**
     * Update driver status for multiple drivers (admin only)
     */
    void bulkUpdateDriversStatus(List<Long> ids, String status);

    /**
     * Get rides assigned to a specific driver
     */
    List<Object> getRidesForDriver(Long driverId);
}

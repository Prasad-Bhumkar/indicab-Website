package com.indicab.service.impl;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import com.indicab.service.DriverService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of DriverService
 * Handles driver registration, application management, and approval workflow
 */
@Service
public class DriverServiceImpl implements DriverService {

    private static final Logger logger = LoggerFactory.getLogger(DriverServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public DriverResponseDTO applyAsDriver(Long userId, DriverRegistrationDTO registrationDTO) {
        logger.info("Processing driver application for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new IllegalArgumentException("User not found with ID: " + userId);
                });

        // Set driver details
        user.setLicenseNumber(registrationDTO.getLicenseNumber());
        user.setVehicleType(registrationDTO.getVehicleType());
        user.setPhone(registrationDTO.getPhoneNumber());
        user.setAddress(registrationDTO.getAddress());
        user.setDriverStatus("PENDING");
        user.setDriverAppliedAt(LocalDateTime.now());
        user.setRole("DRIVER");

        User savedUser = userRepository.save(user);
        logger.info("Driver application submitted with status PENDING for user ID: {}", userId);

        return mapToDriverResponseDTO(savedUser);
    }

    @Override
    public List<DriverResponseDTO> getPendingApplications() {
        logger.debug("Fetching all pending driver applications");
        List<User> pendingDrivers = userRepository.findAll().stream()
                .filter(u -> "PENDING".equals(u.getDriverStatus()))
                .collect(Collectors.toList());
        logger.info("Found {} pending driver applications", pendingDrivers.size());
        return pendingDrivers.stream()
                .map(this::mapToDriverResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponseDTO> getApprovedDrivers() {
        logger.debug("Fetching all approved drivers");
        List<User> approvedDrivers = userRepository.findAll().stream()
                .filter(u -> "APPROVED".equals(u.getDriverStatus()))
                .collect(Collectors.toList());
        logger.info("Found {} approved drivers", approvedDrivers.size());
        return approvedDrivers.stream()
                .map(this::mapToDriverResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponseDTO> getAllDrivers() {
        logger.debug("Fetching all drivers");
        List<User> drivers = userRepository.findAll().stream()
                .filter(u -> "DRIVER".equals(u.getRole()))
                .collect(Collectors.toList());
        logger.info("Found {} drivers in total", drivers.size());
        return drivers.stream()
                .map(this::mapToDriverResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponseDTO getDriverById(Long driverId) {
        logger.debug("Fetching driver with ID: {}", driverId);
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> {
                    logger.error("Driver not found with ID: {}", driverId);
                    return new IllegalArgumentException("Driver not found with ID: " + driverId);
                });
        return mapToDriverResponseDTO(driver);
    }

    @Override
    public DriverResponseDTO reviewDriverApplication(DriverApprovalDTO approvalDTO) {
        logger.info("Processing driver application review for driver ID: {}, status: {}",
                approvalDTO.getDriverId(), approvalDTO.getStatus());

        User driver = userRepository.findById(approvalDTO.getDriverId())
                .orElseThrow(() -> {
                    logger.error("Driver not found with ID: {}", approvalDTO.getDriverId());
                    return new IllegalArgumentException("Driver not found with ID: " + approvalDTO.getDriverId());
                });

        if ("APPROVED".equals(approvalDTO.getStatus())) {
            driver.setDriverStatus("APPROVED");
            driver.setDriverApprovedAt(LocalDateTime.now());
            logger.info("Driver application APPROVED for driver ID: {}", approvalDTO.getDriverId());
        } else if ("REJECTED".equals(approvalDTO.getStatus())) {
            driver.setDriverStatus("REJECTED");
            logger.info("Driver application REJECTED for driver ID: {}", approvalDTO.getDriverId());
        } else {
            logger.warn("Invalid approval status: {}", approvalDTO.getStatus());
            throw new IllegalArgumentException("Invalid approval status. Must be APPROVED or REJECTED.");
        }

        User updatedDriver = userRepository.save(driver);
        logger.info("Driver application review completed for driver ID: {}", approvalDTO.getDriverId());
        return mapToDriverResponseDTO(updatedDriver);
    }

    @Override
    public User getDriverByUserId(Long userId) {
        logger.debug("Fetching driver by user ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Driver not found with user ID: {}", userId);
                    return new IllegalArgumentException("Driver not found with user ID: " + userId);
                });
    }

    /**
     * Convert User entity to DriverResponseDTO
     */
    private DriverResponseDTO mapToDriverResponseDTO(User user) {
        return new DriverResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getLicenseNumber(),
                user.getVehicleType(),
                user.getDriverStatus(),
                user.getDriverAppliedAt(),
                user.getDriverApprovedAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

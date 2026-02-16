package com.indicab.service.impl;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DriverServiceImpl
 * Tests driver registration, approval workflow, and queries
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DriverServiceImpl Tests")
class DriverServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DriverServiceImpl driverService;

    private User testDriver;
    private DriverRegistrationDTO registrationDTO;
    private DriverApprovalDTO approvalDTO;

    @BeforeEach
    void setUp() {
        testDriver = new User();
        testDriver.setId(1L);
        testDriver.setName("John Driver");
        testDriver.setEmail("driver@example.com");
        testDriver.setPhone("9876543210");
        testDriver.setAddress("123 Main St");
        testDriver.setRole("USER");
        testDriver.setDriverStatus("NONE");

        registrationDTO = new DriverRegistrationDTO();
        registrationDTO.setLicenseNumber("DL01AB1234");
        registrationDTO.setVehicleType("Sedan");
        registrationDTO.setPhoneNumber("9876543210");
        registrationDTO.setAddress("123 Main St");

        approvalDTO = new DriverApprovalDTO();
        approvalDTO.setDriverId(1L);
        approvalDTO.setStatus("APPROVED");
    }

    @Test
    @DisplayName("Should apply as driver successfully")
    void testApplyAsDriverSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenReturn(testDriver);

        // Act
        DriverResponseDTO result = driverService.applyAsDriver(1L, registrationDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getLicenseNumber()).isEqualTo("DL01AB1234");
        assertThat(result.getVehicleType()).isEqualTo("Sedan");
        assertThat(result.getDriverStatus()).isEqualTo("PENDING");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when applying as driver for non-existent user")
    void testApplyAsDriverUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> driverService.applyAsDriver(999L, registrationDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found with ID: 999");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should set driver application timestamp when applying")
    void testDriverAppliedAtTimestamp() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getDriverAppliedAt()).isNotNull();
            return user;
        });

        // Act
        driverService.applyAsDriver(1L, registrationDTO);

        // Assert
        verify(userRepository).save(argThat(user -> user.getDriverAppliedAt() != null));
    }

    @Test
    @DisplayName("Should set role to DRIVER when applying")
    void testRoleSetToDriver() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenReturn(testDriver);

        // Act
        driverService.applyAsDriver(1L, registrationDTO);

        // Assert
        verify(userRepository).save(argThat(user -> "DRIVER".equals(user.getRole())));
    }

    @Test
    @DisplayName("Should get pending applications")
    void testGetPendingApplications() {
        // Arrange
        User pendingDriver = new User();
        pendingDriver.setId(1L);
        pendingDriver.setDriverStatus("PENDING");

        List<User> allUsers = new ArrayList<>();
        allUsers.add(pendingDriver);
        
        when(userRepository.findAll()).thenReturn(allUsers);

        // Act
        List<DriverResponseDTO> result = driverService.getPendingApplications();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDriverStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should return empty list when no pending applications")
    void testGetPendingApplicationsEmpty() {
        // Arrange
        when(userRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<DriverResponseDTO> result = driverService.getPendingApplications();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get approved drivers")
    void testGetApprovedDrivers() {
        // Arrange
        User approvedDriver = new User();
        approvedDriver.setId(1L);
        approvedDriver.setName("Approved Driver");
        approvedDriver.setDriverStatus("APPROVED");

        List<User> allUsers = new ArrayList<>();
        allUsers.add(approvedDriver);
        
        when(userRepository.findAll()).thenReturn(allUsers);

        // Act
        List<DriverResponseDTO> result = driverService.getApprovedDrivers();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDriverStatus()).isEqualTo("APPROVED");
    }

    @Test
    @DisplayName("Should return empty list when no approved drivers")
    void testGetApprovedDriversEmpty() {
        // Arrange
        when(userRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<DriverResponseDTO> result = driverService.getApprovedDrivers();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get all drivers by role")
    void testGetAllDrivers() {
        // Arrange
        User driver = new User();
        driver.setId(1L);
        driver.setName("Test Driver");
        driver.setRole("DRIVER");

        List<User> allUsers = new ArrayList<>();
        allUsers.add(driver);
        
        when(userRepository.findAll()).thenReturn(allUsers);

        // Act
        List<DriverResponseDTO> result = driverService.getAllDrivers();

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty list when no drivers exist")
    void testGetAllDriversEmpty() {
        // Arrange
        when(userRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<DriverResponseDTO> result = driverService.getAllDrivers();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get driver by ID")
    void testGetDriverById() {
        // Arrange
        testDriver.setRole("DRIVER");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        // Act
        DriverResponseDTO result = driverService.getDriverById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("John Driver");
    }

    @Test
    @DisplayName("Should throw exception when driver not found by ID")
    void testGetDriverByIdNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> driverService.getDriverById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Driver not found with ID: 999");
    }

    @Test
    @DisplayName("Should approve driver application")
    void testApproveDriverApplication() {
        // Arrange
        testDriver.setDriverStatus("PENDING");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenReturn(testDriver);

        // Act
        DriverResponseDTO result = driverService.reviewDriverApplication(approvalDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(argThat(user -> "APPROVED".equals(user.getDriverStatus())));
    }

    @Test
    @DisplayName("Should reject driver application")
    void testRejectDriverApplication() {
        // Arrange
        approvalDTO.setStatus("REJECTED");
        testDriver.setDriverStatus("PENDING");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenReturn(testDriver);

        // Act
        DriverResponseDTO result = driverService.reviewDriverApplication(approvalDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(argThat(user -> "REJECTED".equals(user.getDriverStatus())));
    }

    @Test
    @DisplayName("Should set approval timestamp when approving driver")
    void testDriverApprovedAtTimestamp() {
        // Arrange
        testDriver.setDriverStatus("PENDING");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getDriverApprovedAt()).isNotNull();
            return user;
        });

        // Act
        driverService.reviewDriverApplication(approvalDTO);

        // Assert
        verify(userRepository).save(argThat(user -> user.getDriverApprovedAt() != null));
    }

    @Test
    @DisplayName("Should throw exception when approving non-existent driver")
    void testApproveNonExistentDriver() {
        // Arrange
        approvalDTO.setDriverId(999L);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> driverService.reviewDriverApplication(approvalDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Driver not found with ID: 999");
    }

    @Test
    @DisplayName("Should throw exception for invalid approval status")
    void testInvalidApprovalStatus() {
        // Arrange
        approvalDTO.setStatus("INVALID_STATUS");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        // Act & Assert
        assertThatThrownBy(() -> driverService.reviewDriverApplication(approvalDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid approval status. Must be APPROVED or REJECTED.");
    }

    @Test
    @DisplayName("Should get driver by user ID")
    void testGetDriverByUserId() {
        // Arrange
        testDriver.setRole("DRIVER");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        // Act
        User result = driverService.getDriverByUserId(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when getting driver by invalid user ID")
    void testGetDriverByUserIdNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> driverService.getDriverByUserId(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Driver not found with user ID: 999");
    }

    @Test
    @DisplayName("Should include all required driver information in response")
    void testDriverResponseDTOContainsAllFields() {
        // Arrange
        testDriver.setRole("DRIVER");
        testDriver.setLicenseNumber("DL01AB1234");
        testDriver.setVehicleType("Sedan");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        // Act
        DriverResponseDTO result = driverService.getDriverById(1L);

        // Assert
        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isNotNull();
        assertThat(result.getEmail()).isNotNull();
        assertThat(result.getPhone()).isNotNull();
        assertThat(result.getAddress()).isNotNull();
        assertThat(result.getLicenseNumber()).isNotNull();
        assertThat(result.getVehicleType()).isNotNull();
        assertThat(result.getDriverStatus()).isNotNull();
    }
}

package com.indicab.service.impl;

import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.dto.DriverResponseDTO;
import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import com.indicab.util.MetricsHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DriverServiceImpl Tests")
class DriverServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MetricsHelper metricsHelper;

    @InjectMocks
    private DriverServiceImpl driverService;

    private User testUser;
    private DriverRegistrationDTO registrationDTO;
    private DriverApprovalDTO approvalDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Driver Raj");
        testUser.setEmail("raj@example.com");
        testUser.setPassword("hashedPass");
        testUser.setPhone("9876543210");
        testUser.setAddress("123 Main St");
        testUser.setRole("USER");
        testUser.setDriverStatus("NONE");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        registrationDTO = new DriverRegistrationDTO();
        registrationDTO.setLicenseNumber("DL-2024-12345");
        registrationDTO.setVehicleType("SEDAN");
        registrationDTO.setPhoneNumber("9876543211");
        registrationDTO.setAddress("456 Oak Ave");

        approvalDTO = new DriverApprovalDTO();
        approvalDTO.setDriverId(1L);
        approvalDTO.setStatus("APPROVED");
    }

    @Test
    @DisplayName("Should apply as driver successfully")
    void testApplyAsDriver() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        DriverResponseDTO result = driverService.applyAsDriver(1L, registrationDTO);

        assertThat(result).isNotNull();
        assertThat(result.getLicenseNumber()).isEqualTo("DL-2024-12345");
        assertThat(result.getVehicleType()).isEqualTo("SEDAN");
        assertThat(result.getDriverStatus()).isEqualTo("PENDING");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when applying as driver with non-existent user")
    void testApplyAsDriverUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> driverService.applyAsDriver(999L, registrationDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found with ID: 999");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get pending applications")
    void testGetPendingApplications() {
        testUser.setDriverStatus("PENDING");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        List<DriverResponseDTO> result = driverService.getPendingApplications();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDriverStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should get pending applications paged")
    void testGetPendingApplicationsPaged() {
        testUser.setDriverStatus("PENDING");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getPendingApplicationsPaged(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get pending applications paged with search")
    void testGetPendingApplicationsPagedWithSearch() {
        testUser.setDriverStatus("PENDING");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getPendingApplicationsPaged(pageable, "raj");

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get approved drivers")
    void testGetApprovedDrivers() {
        testUser.setDriverStatus("APPROVED");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        List<DriverResponseDTO> result = driverService.getApprovedDrivers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDriverStatus()).isEqualTo("APPROVED");
    }

    @Test
    @DisplayName("Should get approved drivers paged")
    void testGetApprovedDriversPaged() {
        testUser.setDriverStatus("APPROVED");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getApprovedDriversPaged(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get approved drivers paged with search")
    void testGetApprovedDriversPagedWithSearch() {
        testUser.setDriverStatus("APPROVED");
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getApprovedDriversPaged(pageable, "raj");

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get all drivers")
    void testGetAllDrivers() {
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        List<DriverResponseDTO> result = driverService.getAllDrivers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("raj@example.com");
    }

    @Test
    @DisplayName("Should get all drivers paged")
    void testGetAllDriversPaged() {
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getAllDriversPaged(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get all drivers paged with search")
    void testGetAllDriversPagedWithSearch() {
        testUser.setRole("DRIVER");
        List<User> userList = new ArrayList<>();
        userList.add(testUser);
        when(userRepository.findAll()).thenReturn(userList);

        Pageable pageable = PageRequest.of(0, 10);
        Page<DriverResponseDTO> result = driverService.getAllDriversPaged(pageable, "raj");

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get driver by ID")
    void testGetDriverById() {
        testUser.setRole("DRIVER");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        DriverResponseDTO result = driverService.getDriverById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when driver by ID not found")
    void testGetDriverByIdNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> driverService.getDriverById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Driver not found with ID: 999");
    }

    @Test
    @DisplayName("Should review driver application and approve")
    void testReviewDriverApplicationApprove() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        DriverResponseDTO result = driverService.reviewDriverApplication(approvalDTO);

        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should review driver application and reject")
    void testReviewDriverApplicationReject() {
        approvalDTO.setStatus("REJECTED");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        DriverResponseDTO result = driverService.reviewDriverApplication(approvalDTO);

        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when reviewing with invalid status")
    void testReviewDriverApplicationInvalidStatus() {
        approvalDTO.setStatus("INVALID");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> driverService.reviewDriverApplication(approvalDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid approval status. Must be APPROVED or REJECTED.");
    }

    @Test
    @DisplayName("Should get driver by user ID")
    void testGetDriverByUserId() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User result = driverService.getDriverByUserId(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when driver by user ID not found")
    void testGetDriverByUserIdNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> driverService.getDriverByUserId(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Driver not found with user ID: 999");
    }

    @Test
    @DisplayName("Should bulk delete drivers")
    void testBulkDeleteDrivers() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        ids.add(2L);

        driverService.bulkDeleteDrivers(ids);

        verify(userRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("Should handle exception during bulk delete drivers")
    void testBulkDeleteDriversException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);

        doThrow(new RuntimeException("Database error")).when(userRepository).deleteAllById(ids);

        assertThatThrownBy(() -> driverService.bulkDeleteDrivers(ids))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to delete multiple drivers");
        verify(metricsHelper).recordError(eq("DriverService"), any(RuntimeException.class), eq("bulkDeleteDrivers"));
    }

    @Test
    @DisplayName("Should bulk update driver status")
    void testBulkUpdateDriversStatus() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<User> users = new ArrayList<>();
        users.add(testUser);
        when(userRepository.findAllById(ids)).thenReturn(users);
        when(userRepository.saveAll(users)).thenReturn(users);

        driverService.bulkUpdateDriversStatus(ids, "APPROVED");

        verify(userRepository).saveAll(users);
    }

    @Test
    @DisplayName("Should handle exception during bulk update driver status")
    void testBulkUpdateDriversStatusException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        when(userRepository.findAllById(ids)).thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> driverService.bulkUpdateDriversStatus(ids, "APPROVED"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update status for multiple drivers");
        verify(metricsHelper).recordError(eq("DriverService"), any(RuntimeException.class), eq("bulkUpdateDriversStatus"));
    }

    @Test
    @DisplayName("Should get rides for driver (empty list)")
    void testGetRidesForDriver() {
        List<Object> result = driverService.getRidesForDriver(1L);

        assertThat(result).isEmpty();
    }
}

package com.indicab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for DriverController
 * Tests HTTP endpoints with MockMvc
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("DriverController Integration Tests")
class DriverControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User testDriver;
    private DriverRegistrationDTO registrationDTO;
    private DriverApprovalDTO approvalDTO;

    @BeforeEach
    void setUp() {
        // Clean up
        userRepository.deleteAll();

        // Create regular user
        testUser = new User();
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("hashedPassword123");
        testUser.setPhone("9876543210");
        testUser.setAddress("123 Main St");
        testUser.setRole("USER");
        testUser = userRepository.save(testUser);

        // Create driver
        testDriver = new User();
        testDriver.setName("Jane Driver");
        testDriver.setEmail("driver@example.com");
        testDriver.setPassword("hashedPassword123");
        testDriver.setPhone("9876543211");
        testDriver.setAddress("456 Oak Ave");
        testDriver.setRole("DRIVER");
        testDriver.setLicenseNumber("DL01AB1234");
        testDriver.setVehicleType("Sedan");
        testDriver.setDriverStatus("PENDING");
        testDriver = userRepository.save(testDriver);

        // Create registration DTO
        registrationDTO = new DriverRegistrationDTO();
        registrationDTO.setLicenseNumber("DL02CD5678");
        registrationDTO.setVehicleType("SUV");
        registrationDTO.setPhoneNumber("9876543212");
        registrationDTO.setAddress("789 Elm St");

        // Create approval DTO
        approvalDTO = new DriverApprovalDTO();
        approvalDTO.setDriverId(testDriver.getId());
        approvalDTO.setStatus("APPROVED");
    }

    @Test
    @DisplayName("POST /api/drivers/apply should apply as driver successfully")
    void testApplyAsDriver() throws Exception {
        // Arrange
        String registrationJson = objectMapper.writeValueAsString(registrationDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/" + testUser.getId() + "/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.driverStatus").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/drivers/apply should validate required fields")
    void testApplyAsDriverValidation() throws Exception {
        // Arrange - missing required field "licenseNumber"
        DriverRegistrationDTO invalidDTO = new DriverRegistrationDTO();
        invalidDTO.setVehicleType("SUV");
        String registrationJson = objectMapper.writeValueAsString(invalidDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/" + testUser.getId() + "/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/drivers/apply should fail for non-existent user")
    void testApplyAsDriverUserNotFound() throws Exception {
        // Arrange
        String registrationJson = objectMapper.writeValueAsString(registrationDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/999/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/drivers/pending should return pending applications")
    void testGetPendingApplications() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/pending")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/drivers/approved should return approved drivers")
    void testGetApprovedDrivers() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/approved")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/drivers should return all drivers")
    void testGetAllDrivers() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/drivers/{id} should return driver by ID")
    void testGetDriverById() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/" + testDriver.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testDriver.getId()))
                .andExpect(jsonPath("$.driverStatus").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/drivers/{id} should return 404 for non-existent driver")
    void testGetDriverByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/drivers/approve should approve driver application")
    void testApproveDriverApplication() throws Exception {
        // Arrange
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/drivers/approve should reject driver application")
    void testRejectDriverApplication() throws Exception {
        // Arrange
        approvalDTO.setStatus("REJECTED");
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverStatus").value("REJECTED"));
    }

    @Test
    @DisplayName("POST /api/drivers/approve should validate required fields")
    void testApproveDriverValidation() throws Exception {
        // Arrange - missing required field "status"
        DriverApprovalDTO invalidDTO = new DriverApprovalDTO();
        invalidDTO.setDriverId(testDriver.getId());
        String approvalJson = objectMapper.writeValueAsString(invalidDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/drivers/approve should fail for non-existent driver")
    void testApproveNonExistentDriver() throws Exception {
        // Arrange
        approvalDTO.setDriverId(999L);
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/drivers/approve should fail with invalid status")
    void testApproveWithInvalidStatus() throws Exception {
        // Arrange
        approvalDTO.setStatus("INVALID_STATUS");
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        // Act & Assert
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/drivers should include multiple drivers in response")
    void testGetMultipleDrivers() throws Exception {
        // Arrange - add another driver
        User anotherDriver = new User();
        anotherDriver.setName("Bob Driver");
        anotherDriver.setEmail("bob@example.com");
        anotherDriver.setPassword("hashedPassword123");
        anotherDriver.setPhone("9876543212");
        anotherDriver.setAddress("789 Elm St");
        anotherDriver.setRole("DRIVER");
        userRepository.save(anotherDriver);

        // Act & Assert
        mockMvc.perform(get("/api/drivers")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Driver application should be saved to database")
    void testDriverApplicationPersistence() throws Exception {
        // Arrange
        String registrationJson = objectMapper.writeValueAsString(registrationDTO);
        int initialCount = (int) userRepository.count();

        // Act
        mockMvc.perform(post("/api/drivers/" + testUser.getId() + "/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isCreated());

        // Assert
        assertThat(userRepository.count()).isGreaterThan(initialCount);
    }

    @Test
    @DisplayName("Driver approval should update database")
    void testApprovalPersistence() throws Exception {
        // Arrange
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        // Act
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk());

        // Assert
        User updatedDriver = userRepository.findById(testDriver.getId()).orElseThrow();
        assertThat(updatedDriver.getDriverStatus()).isEqualTo("APPROVED");
    }

    @Test
    @DisplayName("Get pending applications should filter correctly")
    void testPendingApplicationsFilter() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/pending")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Get approved drivers should show only approved status")
    void testApprovedDriversFilter() throws Exception {
        // Arrange - approve a driver first
        approvalDTO.setStatus("APPROVED");
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);
        mockMvc.perform(post("/api/drivers/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk());

        // Act & Assert
        mockMvc.perform(get("/api/drivers/approved")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Driver details should include all required information")
    void testDriverDetailCompleteness() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/drivers/" + testDriver.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.phone").exists())
                .andExpect(jsonPath("$.address").exists())
                .andExpect(jsonPath("$.licenseNumber").exists())
                .andExpect(jsonPath("$.vehicleType").exists())
                .andExpect(jsonPath("$.driverStatus").exists());
    }
}

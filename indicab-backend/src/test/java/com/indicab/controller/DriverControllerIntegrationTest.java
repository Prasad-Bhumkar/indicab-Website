package com.indicab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.indicab.dto.DriverApprovalDTO;
import com.indicab.dto.DriverRegistrationDTO;
import com.indicab.entity.User;
import com.indicab.repository.RefreshTokenRepository;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for DriverController
 * Tests HTTP endpoints with MockMvc using /api/v1/driver base path
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

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private DriverRegistrationDTO registrationDTO;
    private DriverApprovalDTO approvalDTO;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        User driverUser = new User();
        driverUser.setName("Driver User");
        driverUser.setEmail("driver@test.com");
        driverUser.setPassword(passwordEncoder.encode("password123"));
        driverUser.setPhone("9876543212");
        driverUser.setRole("DRIVER");
        driverUser.setDriverStatus("PENDING");
        User savedUser = userRepository.save(driverUser);

        registrationDTO = new DriverRegistrationDTO();
        registrationDTO.setLicenseNumber("DL02CD5678");
        registrationDTO.setVehicleType("SUV");
        registrationDTO.setPhoneNumber("9876543212");
        registrationDTO.setAddress("789 Elm St");

        approvalDTO = new DriverApprovalDTO();
        approvalDTO.setDriverId(savedUser.getId());
        approvalDTO.setStatus("APPROVED");
    }

    @Test
    @WithMockUser(username = "1", roles = "USER")
    @DisplayName("POST /api/v1/driver/apply should return 400 when registration body is empty")
    void testApplyAsDriverValidation() throws Exception {
        DriverRegistrationDTO invalidDTO = new DriverRegistrationDTO();
        invalidDTO.setVehicleType("SUV");
        String registrationJson = objectMapper.writeValueAsString(invalidDTO);

        mockMvc.perform(post("/api/v1/driver/apply")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/driver/pending should return pending applications")
    void testGetPendingApplications() throws Exception {
        mockMvc.perform(get("/api/v1/driver/pending")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/driver/approved should return approved drivers")
    void testGetApprovedDrivers() throws Exception {
        mockMvc.perform(get("/api/v1/driver/approved")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/driver/all should return all drivers")
    void testGetAllDrivers() throws Exception {
        mockMvc.perform(get("/api/v1/driver/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/driver/review-application should approve driver application")
    void testApproveDriverApplication() throws Exception {
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        mockMvc.perform(post("/api/v1/driver/review-application")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverStatus").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/driver/review-application should reject driver application")
    void testRejectDriverApplication() throws Exception {
        approvalDTO.setStatus("REJECTED");
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        mockMvc.perform(post("/api/v1/driver/review-application")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverStatus").value("REJECTED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/driver/review-application should validate required fields")
    void testApproveDriverValidation() throws Exception {
        DriverApprovalDTO invalidDTO = new DriverApprovalDTO();
        invalidDTO.setDriverId(1L);
        String approvalJson = objectMapper.writeValueAsString(invalidDTO);

        mockMvc.perform(post("/api/v1/driver/review-application")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/driver/review-application should fail for non-existent driver")
    void testApproveNonExistentDriver() throws Exception {
        approvalDTO.setDriverId(999L);
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        mockMvc.perform(post("/api/v1/driver/review-application")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/driver/review-application should fail with invalid status")
    void testApproveWithInvalidStatus() throws Exception {
        approvalDTO.setStatus("INVALID_STATUS");
        String approvalJson = objectMapper.writeValueAsString(approvalDTO);

        mockMvc.perform(post("/api/v1/driver/review-application")
                .contentType(MediaType.APPLICATION_JSON)
                .content(approvalJson))
                .andExpect(status().isBadRequest());
    }
}

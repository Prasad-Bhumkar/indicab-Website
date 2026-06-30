package com.indicab.controller;

import com.indicab.entity.AuditLog;
import com.indicab.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AdminAuditController
 * Tests audit log management and filtering endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AdminAuditController Tests")
class AdminAuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
    }

    private AuditLog createAuditLog(Long userId, String operation, String resourceType,
                                    String status, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setOperation(operation);
        log.setResourceType(resourceType);
        log.setStatus(status);
        log.setIpAddress(ipAddress);
        log.setCreatedAt(LocalDateTime.now());
        return auditLogRepository.save(log);
    }

    private AuditLog createAuditLogWithDetails(Long userId, String operation, String resourceType,
                                                Long resourceId, String status, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setOperation(operation);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setStatus(status);
        log.setIpAddress(ipAddress);
        log.setCreatedAt(LocalDateTime.now());
        return auditLogRepository.save(log);
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs - Get all audit logs")
    @WithMockUser(roles = "ADMIN")
    void testGetAllAuditLogs() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "UPDATE", "Booking", "SUCCESS", "192.168.1.2");

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs - Filter by operation")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditLogsFilterByOperation() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "UPDATE", "Booking", "SUCCESS", "192.168.1.2");
        createAuditLog(3L, "CREATE", "Driver", "SUCCESS", "192.168.1.3");

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .param("operation", "CREATE")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/user/{userId} - Get by user")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditLogsByUser() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(1L, "UPDATE", "Booking", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "CREATE", "Driver", "SUCCESS", "192.168.1.2");

        mockMvc.perform(get("/api/v1/admin/audit-logs/user/1")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/operation/{operation} - Get by operation type")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditLogsByOperation() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "DELETE", "Booking", "SUCCESS", "192.168.1.2");
        createAuditLog(3L, "DELETE", "Driver", "SUCCESS", "192.168.1.3");

        mockMvc.perform(get("/api/v1/admin/audit-logs/operation/DELETE")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/resource/{resourceType} - Get by resource type")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditLogsByResourceType() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "UPDATE", "Booking", "SUCCESS", "192.168.1.2");
        createAuditLog(3L, "DELETE", "User", "SUCCESS", "192.168.1.3");

        mockMvc.perform(get("/api/v1/admin/audit-logs/resource/User")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/failed - Get failed operations")
    @WithMockUser(roles = "ADMIN")
    void testGetFailedAuditLogs() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");
        createAuditLog(2L, "UPDATE", "Booking", "FAILED", "192.168.1.2");
        createAuditLog(3L, "DELETE", "Driver", "FAILED", "192.168.1.3");

        mockMvc.perform(get("/api/v1/admin/audit-logs/failed")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/statistics - Get statistics")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditStatistics() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statistics").isString());
    }

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs/date-range - Get by date range")
    @WithMockUser(roles = "ADMIN")
    void testGetAuditLogsByDateRange() throws Exception {
        createAuditLog(1L, "CREATE", "User", "SUCCESS", "192.168.1.1");

        LocalDate today = LocalDate.now();
        mockMvc.perform(get("/api/v1/admin/audit-logs/date-range")
                .param("startDate", today.toString())
                .param("endDate", today.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role on audit log endpoints")
    @WithMockUser(roles = "USER")
    void testGetAuditLogsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token on audit log endpoints")
    void testGetAuditLogsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

package com.indicab.controller;

import com.indicab.entity.Package;
import com.indicab.repository.PackageRepository;
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

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AdminPackageController
 * Tests package CRUD, search, filter, and bulk operations
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AdminPackageController Tests")
class AdminPackageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PackageRepository packageRepository;

    @BeforeEach
    void setUp() {
        packageRepository.deleteAll();
    }

    private Package createTestPackage(String name, String type, BigDecimal baseFare, Boolean isActive) {
        Package pkg = new Package();
        pkg.setName(name);
        pkg.setDescription("Test description for " + name);
        pkg.setType(type);
        pkg.setBaseFare(baseFare);
        pkg.setDuration("4 Hours");
        pkg.setValidity("30 Days");
        pkg.setIsActive(isActive);
        return packageRepository.save(pkg);
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages - Get all packages")
    @WithMockUser(roles = "ADMIN")
    void testGetAllPackages() throws Exception {
        createTestPackage("Standard", "hourly", new BigDecimal("500"), true);
        createTestPackage("Premium", "hourly", new BigDecimal("1000"), true);

        mockMvc.perform(get("/api/v1/admin/packages")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages - Filter by search, isActive, and type")
    @WithMockUser(roles = "ADMIN")
    void testGetPackagesWithFilters() throws Exception {
        createTestPackage("Standard Hourly", "hourly", new BigDecimal("500"), true);
        createTestPackage("Premium Hourly", "hourly", new BigDecimal("1000"), true);
        createTestPackage("Weekend Trip", "regional", new BigDecimal("2000"), true);
        createTestPackage("Inactive Plan", "hourly", new BigDecimal("300"), false);

        mockMvc.perform(get("/api/v1/admin/packages")
                .param("search", "Hourly")
                .param("isActive", "true")
                .param("type", "hourly")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages/active - Get active packages")
    @WithMockUser(roles = "ADMIN")
    void testGetActivePackages() throws Exception {
        createTestPackage("Active Package", "hourly", new BigDecimal("500"), true);
        createTestPackage("Inactive Package", "hourly", new BigDecimal("300"), false);

        mockMvc.perform(get("/api/v1/admin/packages/active")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages/type/{type} - Get packages by type")
    @WithMockUser(roles = "ADMIN")
    void testGetPackagesByType() throws Exception {
        createTestPackage("Hourly One", "hourly", new BigDecimal("500"), true);
        createTestPackage("Hourly Two", "hourly", new BigDecimal("800"), true);
        createTestPackage("Regional Trip", "regional", new BigDecimal("2000"), true);

        mockMvc.perform(get("/api/v1/admin/packages/type/hourly")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages/{id} - Get package by ID")
    @WithMockUser(roles = "ADMIN")
    void testGetPackageById() throws Exception {
        Package pkg = createTestPackage("Test Package", "hourly", new BigDecimal("500"), true);

        mockMvc.perform(get("/api/v1/admin/packages/" + pkg.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pkg.getId()))
                .andExpect(jsonPath("$.name").value("Test Package"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/packages/{id} - Package not found")
    @WithMockUser(roles = "ADMIN")
    void testGetPackageByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/admin/packages/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/admin/packages - Create package")
    @WithMockUser(roles = "ADMIN")
    void testCreatePackage() throws Exception {
        mockMvc.perform(post("/api/v1/admin/packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"New Package\", \"description\": \"A brand new package\", " +
                         "\"type\": \"hourly\", \"baseFare\": 750, \"duration\": \"6 Hours\", " +
                         "\"validity\": \"30 Days\", \"isActive\": true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Package"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/packages/{id} - Update package")
    @WithMockUser(roles = "ADMIN")
    void testUpdatePackage() throws Exception {
        Package pkg = createTestPackage("Original", "hourly", new BigDecimal("500"), true);

        mockMvc.perform(put("/api/v1/admin/packages/" + pkg.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Updated Package\", \"description\": \"Updated description\", " +
                         "\"type\": \"regional\", \"baseFare\": 1200, \"duration\": \"8 Hours\", " +
                         "\"validity\": \"60 Days\", \"isActive\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Package"))
                .andExpect(jsonPath("$.type").value("regional"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/packages/{id} - Delete package")
    @WithMockUser(roles = "ADMIN")
    void testDeletePackage() throws Exception {
        Package pkg = createTestPackage("To Delete", "hourly", new BigDecimal("500"), true);

        mockMvc.perform(delete("/api/v1/admin/packages/" + pkg.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Package deleted successfully"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/packages/bulk - Bulk delete packages")
    @WithMockUser(roles = "ADMIN")
    void testBulkDeletePackages() throws Exception {
        Package pkg1 = createTestPackage("Pkg One", "hourly", new BigDecimal("500"), true);
        Package pkg2 = createTestPackage("Pkg Two", "hourly", new BigDecimal("800"), true);

        mockMvc.perform(delete("/api/v1/admin/packages/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[" + pkg1.getId() + "," + pkg2.getId() + "]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Packages deleted successfully"))
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/packages/bulk/status - Bulk update package status")
    @WithMockUser(roles = "ADMIN")
    void testBulkUpdatePackagesStatus() throws Exception {
        Package pkg1 = createTestPackage("Pkg One", "hourly", new BigDecimal("500"), true);
        Package pkg2 = createTestPackage("Pkg Two", "hourly", new BigDecimal("800"), false);

        mockMvc.perform(put("/api/v1/admin/packages/bulk/status")
                .param("status", "active")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[" + pkg1.getId() + "," + pkg2.getId() + "]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Packages updated successfully"))
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role on package endpoints")
    @WithMockUser(roles = "USER")
    void testGetPackagesUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/packages")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token on package endpoints")
    void testGetPackagesUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/admin/packages")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

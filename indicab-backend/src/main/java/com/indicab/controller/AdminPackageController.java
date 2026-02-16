package com.indicab.controller;

import com.indicab.dto.PackageDTO;
import com.indicab.entity.Package;
import com.indicab.service.impl.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/packages")
@Tag(name = "Admin Package Management", description = "APIs for managing travel packages")
@SecurityRequirement(name = "Bearer Token")
public class AdminPackageController {
    
    @Autowired
    private PackageService packageService;
    
    /**
     * Get all packages with pagination
     */
    @GetMapping
    @Operation(summary = "Get all packages", description = "Retrieve all packages with pagination")
    public ResponseEntity<?> getAllPackages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Package> packages = packageService.getAllPackages(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", packages.getContent());
            response.put("totalElements", packages.getTotalElements());
            response.put("totalPages", packages.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching packages: " + e.getMessage()));
        }
    }
    
    /**
     * Get active packages with pagination
     */
    @GetMapping("/active")
    @Operation(summary = "Get active packages", description = "Retrieve only active packages")
    public ResponseEntity<?> getActivePackages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Package> packages = packageService.getActivePackages(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", packages.getContent());
            response.put("totalElements", packages.getTotalElements());
            response.put("totalPages", packages.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching active packages: " + e.getMessage()));
        }
    }
    
    /**
     * Get packages by type
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get packages by type", description = "Retrieve packages filtered by type")
    public ResponseEntity<?> getPackagesByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Package> packages = packageService.getPackagesByType(type, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", packages.getContent());
            response.put("totalElements", packages.getTotalElements());
            response.put("totalPages", packages.getTotalPages());
            response.put("type", type);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching packages by type: " + e.getMessage()));
        }
    }
    
    /**
     * Get package by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get package by ID", description = "Retrieve a specific package by its ID")
    public ResponseEntity<?> getPackageById(@PathVariable Long id) {
        try {
            Package pkg = packageService.getPackageById(id);
            return ResponseEntity.ok(pkg);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching package: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new package
     */
    @PostMapping
    @Operation(summary = "Create package", description = "Create a new travel package")
    public ResponseEntity<?> createPackage(@Valid @RequestBody PackageDTO packageDTO) {
        try {
            Package createdPackage = packageService.createPackage(packageDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPackage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating package: " + e.getMessage()));
        }
    }
    
    /**
     * Update package
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update package", description = "Update an existing travel package")
    public ResponseEntity<?> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageDTO packageDTO) {
        try {
            Package updatedPackage = packageService.updatePackage(id, packageDTO);
            return ResponseEntity.ok(updatedPackage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating package: " + e.getMessage()));
        }
    }
    
    /**
     * Delete package
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete package", description = "Delete a travel package")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        try {
            packageService.deletePackage(id);
            return ResponseEntity.ok(Map.of("message", "Package deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting package: " + e.getMessage()));
        }
    }
}

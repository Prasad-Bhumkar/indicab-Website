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
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/packages")
@Tag(name = "Admin Package Management", description = "APIs for managing travel packages")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints require ADMIN role
public class AdminPackageController {
    
    @Autowired
    private PackageService packageService;
    
    /**
     * Get all packages with pagination and sorting
     */
    @GetMapping
    @Operation(summary = "Get all packages", description = "Retrieve all packages with pagination and sorting")
    public ResponseEntity<Page<Package>> getAllPackages(Pageable pageable) {
        try {
            Page<Package> packages = packageService.getAllPackages(pageable);
            return ResponseEntity.ok(packages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active packages with pagination and sorting
     */
    @GetMapping("/active")
    @Operation(summary = "Get active packages", description = "Retrieve only active packages with pagination and sorting")
    public ResponseEntity<Page<Package>> getActivePackages(Pageable pageable) {
        try {
            Page<Package> packages = packageService.getActivePackages(pageable);
            return ResponseEntity.ok(packages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get packages by type with pagination and sorting
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get packages by type", description = "Retrieve packages filtered by type with pagination and sorting")
    public ResponseEntity<Page<Package>> getPackagesByType(
            @PathVariable String type,
            Pageable pageable) {
        try {
            Page<Package> packages = packageService.getPackagesByType(type, pageable);
            return ResponseEntity.ok(packages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    /**
     * Delete multiple packages
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete packages", description = "Delete multiple packages at once (ADMIN only)")
    public ResponseEntity<?> bulkDeletePackages(@RequestBody java.util.List<Long> ids) {
        try {
            packageService.bulkDeletePackages(ids);
            return ResponseEntity.ok(Map.of("message", "Packages deleted successfully", "count", ids.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting packages: " + e.getMessage()));
        }
    }

    /**
     * Bulk update packages status
     */
    @PutMapping("/bulk/status")
    @Operation(summary = "Bulk update package status", description = "Update status for multiple packages at once (ADMIN only)")
    public ResponseEntity<?> bulkUpdatePackagesStatus(
            @RequestBody java.util.List<Long> ids,
            @RequestParam String status) {
        try {
            packageService.bulkUpdatePackagesStatus(ids, status);
            return ResponseEntity.ok(Map.of("message", "Packages updated successfully", "count", ids.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating packages: " + e.getMessage()));
        }
    }
}

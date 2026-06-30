package com.indicab.service.impl;

import com.indicab.dto.PackageDTO;
import com.indicab.entity.Package;
import com.indicab.repository.PackageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PackageService Tests")
class PackageServiceTest {

    @Mock
    private PackageRepository packageRepository;

    @InjectMocks
    private PackageService packageService;

    private Package testPackage;
    private PackageDTO packageDTO;

    @BeforeEach
    void setUp() {
        testPackage = new Package("City Package", "Explore the city with this package",
                "hourly", new BigDecimal("500.00"), "4 Hours", "7 Days",
                BigDecimal.TEN, "AC,Music,Water", "https://example.com/pkg.jpg", true);
        setId(testPackage, 1L);
        testPackage.setCreatedAt(LocalDateTime.now());
        testPackage.setUpdatedAt(LocalDateTime.now());

        packageDTO = new PackageDTO("Highway Package", "Long distance travel package",
                "regional", new BigDecimal("2000.00"), "8 Hours", "30 Days",
                BigDecimal.valueOf(15), "AC,Snacks,Music", "https://example.com/highway.jpg", true);
    }

    private void setId(Object entity, Long id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set id via reflection", e);
        }
    }

    @Test
    @DisplayName("Should create package successfully")
    void testCreatePackage() {
        when(packageRepository.existsByName("Highway Package")).thenReturn(false);
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);

        Package result = packageService.createPackage(packageDTO);

        assertThat(result).isNotNull();
        verify(packageRepository).save(any(Package.class));
    }

    @Test
    @DisplayName("Should throw exception when creating package with duplicate name")
    void testCreatePackageDuplicateName() {
        when(packageRepository.existsByName("Highway Package")).thenReturn(true);

        assertThatThrownBy(() -> packageService.createPackage(packageDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Package with name 'Highway Package' already exists");
        verify(packageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get all packages with pagination")
    void testGetAllPackages() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findAll(pageable)).thenReturn(pkgPage);

        Page<Package> result = packageService.getAllPackages(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get all packages with specification")
    void testGetAllPackagesWithSpecification() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(pkgPage);

        Specification<Package> spec = (root, query, cb) -> cb.equal(root.get("isActive"), true);
        Page<Package> result = packageService.getAllPackages(pageable, spec);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get active packages")
    void testGetActivePackages() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findByIsActiveTrue(pageable)).thenReturn(pkgPage);

        Page<Package> result = packageService.getActivePackages(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get packages by type")
    void testGetPackagesByType() {
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);

        when(packageRepository.findByType("hourly")).thenReturn(pkgList);

        List<Package> result = packageService.getPackagesByType("hourly");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("hourly");
    }

    @Test
    @DisplayName("Should get active packages by type")
    void testGetActivePackagesByType() {
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);

        when(packageRepository.findByTypeAndIsActive("hourly", true)).thenReturn(pkgList);

        List<Package> result = packageService.getActivePackagesByType("hourly");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should get packages by type with pagination")
    void testGetPackagesByTypePaged() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findByType("hourly", pageable)).thenReturn(pkgPage);

        Page<Package> result = packageService.getPackagesByType("hourly", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get active packages by type with pagination")
    void testGetActivePackagesByTypePaged() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findByTypeAndIsActive("hourly", true, pageable)).thenReturn(pkgPage);

        Page<Package> result = packageService.getActivePackagesByType("hourly", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get package by ID")
    void testGetPackageById() {
        when(packageRepository.findById(1L)).thenReturn(Optional.of(testPackage));

        Package result = packageService.getPackageById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when package ID not found")
    void testGetPackageByIdNotFound() {
        when(packageRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> packageService.getPackageById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Package not found with ID: 999");
    }

    @Test
    @DisplayName("Should update package successfully")
    void testUpdatePackage() {
        when(packageRepository.findById(1L)).thenReturn(Optional.of(testPackage));
        when(packageRepository.existsByName("Highway Package")).thenReturn(false);
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);

        Package result = packageService.updatePackage(1L, packageDTO);

        assertThat(result).isNotNull();
        verify(packageRepository).save(any(Package.class));
    }

    @Test
    @DisplayName("Should throw exception when updating package with duplicate name")
    void testUpdatePackageDuplicateName() {
        when(packageRepository.findById(1L)).thenReturn(Optional.of(testPackage));
        when(packageRepository.existsByName("Highway Package")).thenReturn(true);

        assertThatThrownBy(() -> packageService.updatePackage(1L, packageDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Package with name 'Highway Package' already exists");
    }

    @Test
    @DisplayName("Should delete package successfully")
    void testDeletePackage() {
        when(packageRepository.existsById(1L)).thenReturn(true);

        packageService.deletePackage(1L);

        verify(packageRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent package")
    void testDeletePackageNotFound() {
        when(packageRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> packageService.deletePackage(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Package not found with ID: 999");
        verify(packageRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should get packages by status")
    void testGetPackagesByStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Package> pkgList = new ArrayList<>();
        pkgList.add(testPackage);
        Page<Package> pkgPage = new PageImpl<>(pkgList, pageable, pkgList.size());

        when(packageRepository.findByIsActive(true, pageable)).thenReturn(pkgPage);

        Page<Package> result = packageService.getPackagesByStatus(true, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should bulk delete packages")
    void testBulkDeletePackages() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        ids.add(2L);

        packageService.bulkDeletePackages(ids);

        verify(packageRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("Should handle exception during bulk delete packages")
    void testBulkDeletePackagesException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);

        doThrow(new RuntimeException("Database error")).when(packageRepository).deleteAllById(ids);

        assertThatThrownBy(() -> packageService.bulkDeletePackages(ids))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to delete multiple packages");
    }

    @Test
    @DisplayName("Should bulk update package status to active")
    void testBulkUpdatePackagesStatusActive() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<Package> packages = new ArrayList<>();
        packages.add(testPackage);
        when(packageRepository.findAllById(ids)).thenReturn(packages);
        when(packageRepository.saveAll(packages)).thenReturn(packages);

        packageService.bulkUpdatePackagesStatus(ids, "active");

        verify(packageRepository).saveAll(packages);
    }

    @Test
    @DisplayName("Should bulk update package status to inactive")
    void testBulkUpdatePackagesStatusInactive() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<Package> packages = new ArrayList<>();
        packages.add(testPackage);
        when(packageRepository.findAllById(ids)).thenReturn(packages);
        when(packageRepository.saveAll(packages)).thenReturn(packages);

        packageService.bulkUpdatePackagesStatus(ids, "inactive");

        verify(packageRepository).saveAll(packages);
    }

    @Test
    @DisplayName("Should handle exception during bulk update package status")
    void testBulkUpdatePackagesStatusException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        when(packageRepository.findAllById(ids)).thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> packageService.bulkUpdatePackagesStatus(ids, "active"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update status for multiple packages");
    }
}

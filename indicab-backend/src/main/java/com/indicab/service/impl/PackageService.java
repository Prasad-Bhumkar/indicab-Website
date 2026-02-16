package com.indicab.service.impl;

import com.indicab.dto.PackageDTO;
import com.indicab.entity.Package;
import com.indicab.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PackageService {
    
    @Autowired
    private PackageRepository packageRepository;
    
    /**
     * Create a new package
     */
    public Package createPackage(PackageDTO packageDTO) {
        if (packageRepository.existsByName(packageDTO.getName())) {
            throw new IllegalArgumentException("Package with name '" + packageDTO.getName() + "' already exists");
        }
        
        Package pkg = new Package(
            packageDTO.getName(),
            packageDTO.getDescription(),
            packageDTO.getType(),
            packageDTO.getBaseFare(),
            packageDTO.getDuration(),
            packageDTO.getValidity(),
            packageDTO.getDiscountPercentage(),
            packageDTO.getFeatures(),
            packageDTO.getImageUrl(),
            packageDTO.getIsActive()
        );
        
        return packageRepository.save(pkg);
    }
    
    /**
     * Get all packages with pagination
     */
    public Page<Package> getAllPackages(Pageable pageable) {
        return packageRepository.findAll(pageable);
    }
    
    /**
     * Get all active packages with pagination
     */
    public Page<Package> getActivePackages(Pageable pageable) {
        return packageRepository.findByIsActiveTrue(pageable);
    }
    
    /**
     * Get packages by type
     */
    public List<Package> getPackagesByType(String type) {
        return packageRepository.findByType(type);
    }
    
    /**
     * Get active packages by type
     */
    public List<Package> getActivePackagesByType(String type) {
        return packageRepository.findByTypeAndIsActive(type, true);
    }
    
    /**
     * Get packages by type with pagination
     */
    public Page<Package> getPackagesByType(String type, Pageable pageable) {
        return packageRepository.findByType(type, pageable);
    }
    
    /**
     * Get active packages by type with pagination
     */
    public Page<Package> getActivePackagesByType(String type, Pageable pageable) {
        return packageRepository.findByTypeAndIsActive(type, true, pageable);
    }
    
    /**
     * Get package by ID
     */
    public Package getPackageById(Long id) {
        return packageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Package not found with ID: " + id));
    }
    
    /**
     * Update package
     */
    public Package updatePackage(Long id, PackageDTO packageDTO) {
        Package pkg = getPackageById(id);
        
        // Check if new name conflicts with existing packages
        if (!pkg.getName().equals(packageDTO.getName()) && 
            packageRepository.existsByName(packageDTO.getName())) {
            throw new IllegalArgumentException("Package with name '" + packageDTO.getName() + "' already exists");
        }
        
        pkg.setName(packageDTO.getName());
        pkg.setDescription(packageDTO.getDescription());
        pkg.setType(packageDTO.getType());
        pkg.setBaseFare(packageDTO.getBaseFare());
        pkg.setDuration(packageDTO.getDuration());
        pkg.setValidity(packageDTO.getValidity());
        pkg.setDiscountPercentage(packageDTO.getDiscountPercentage());
        pkg.setFeatures(packageDTO.getFeatures());
        pkg.setImageUrl(packageDTO.getImageUrl());
        pkg.setIsActive(packageDTO.getIsActive());
        
        return packageRepository.save(pkg);
    }
    
    /**
     * Delete package
     */
    public void deletePackage(Long id) {
        if (!packageRepository.existsById(id)) {
            throw new IllegalArgumentException("Package not found with ID: " + id);
        }
        packageRepository.deleteById(id);
    }
    
    /**
     * Get packages by active status with pagination
     */
    public Page<Package> getPackagesByStatus(Boolean isActive, Pageable pageable) {
        return packageRepository.findByIsActive(isActive, pageable);
    }
}

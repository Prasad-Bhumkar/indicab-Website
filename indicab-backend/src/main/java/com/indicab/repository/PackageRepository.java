package com.indicab.repository;

import com.indicab.entity.Package;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    
    /**
     * Find packages by type
     */
    List<Package> findByType(String type);
    
    /**
     * Find active packages by type
     */
    List<Package> findByTypeAndIsActive(String type, Boolean isActive);
    
    /**
     * Find packages by active status
     */
    Page<Package> findByIsActive(Boolean isActive, Pageable pageable);
    
    /**
     * Find active packages with pagination
     */
    Page<Package> findByIsActiveTrue(Pageable pageable);
    
    /**
     * Find all packages by type with pagination
     */
    Page<Package> findByType(String type, Pageable pageable);
    
    /**
     * Find active packages by type with pagination
     */
    Page<Package> findByTypeAndIsActive(String type, Boolean isActive, Pageable pageable);
    
    /**
     * Check if package exists by name
     */
    boolean existsByName(String name);
}

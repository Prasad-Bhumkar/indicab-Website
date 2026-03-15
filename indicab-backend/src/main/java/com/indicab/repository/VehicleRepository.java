package com.indicab.repository;

import com.indicab.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {
    
    Optional<Vehicle> findByType(String type);
    
    Page<Vehicle> findByIsActive(Boolean isActive, Pageable pageable);
    
    Page<Vehicle> findAll(Pageable pageable);
}

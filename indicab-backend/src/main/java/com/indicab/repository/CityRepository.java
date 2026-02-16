package com.indicab.repository;

import com.indicab.entity.City;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    
    Optional<City> findByName(String name);
    
    Page<City> findByIsActive(Boolean isActive, Pageable pageable);
    
    Page<City> findAll(Pageable pageable);
}

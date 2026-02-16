package com.indicab.repository;

import com.indicab.entity.Route;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    
    @Query("SELECT r FROM Route r WHERE " +
           "(LOWER(r.fromCity) = LOWER(:fromCity) AND LOWER(r.toCity) = LOWER(:toCity)) OR " +
           "(LOWER(r.fromCity) = LOWER(:toCity) AND LOWER(r.toCity) = LOWER(:fromCity))")
    Optional<Route> findByFromAndToCity(@Param("fromCity") String fromCity, @Param("toCity") String toCity);
    
    Page<Route> findByIsPopular(Boolean isPopular, Pageable pageable);
    
    Page<Route> findAll(Pageable pageable);
}

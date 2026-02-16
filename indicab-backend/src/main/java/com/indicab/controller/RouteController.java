package com.indicab.controller;

import com.indicab.dto.RouteDTO;
import com.indicab.entity.Route;
import com.indicab.repository.RouteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing popular routes
 */
@RestController
@RequestMapping("/api/v1/routes")
@Tag(name = "Routes", description = "Popular routes management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class RouteController {
    
    private static final Logger logger = LoggerFactory.getLogger(RouteController.class);
    
    @Autowired
    private RouteRepository routeRepository;
    
    /**
     * Get all routes with pagination
     */
    @GetMapping
    @Operation(summary = "Get all routes", description = "Retrieve all popular routes with pagination")
    @ApiResponse(responseCode = "200", description = "Routes retrieved successfully")
    public ResponseEntity<Page<Route>> getAllRoutes(Pageable pageable) {
        logger.info("Fetching all routes");
        Page<Route> routes = routeRepository.findAll(pageable);
        return ResponseEntity.ok(routes);
    }
    
    /**
     * Get route by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get route by ID", description = "Retrieve a specific route by its ID")
    @ApiResponse(responseCode = "200", description = "Route retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Route not found")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        logger.info("Fetching route with ID: {}", id);
        return routeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new route
     */
    @PostMapping
    @Operation(summary = "Create route", description = "Create a new popular route")
    @ApiResponse(responseCode = "201", description = "Route created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<Route> createRoute(@Valid @RequestBody RouteDTO routeDTO) {
        logger.info("Creating new route: from {} to {}", routeDTO.getFromCity(), routeDTO.getToCity());
        
        Route route = new Route(
            routeDTO.getFromCity(),
            routeDTO.getToCity(),
            routeDTO.getDistance(),
            routeDTO.getFixedPrice(),
            routeDTO.getIsPopular()
        );
        
        Route savedRoute = routeRepository.save(route);
        logger.info("Route created successfully with ID: {}", savedRoute.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoute);
    }
    
    /**
     * Update route
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update route", description = "Update an existing route")
    @ApiResponse(responseCode = "200", description = "Route updated successfully")
    @ApiResponse(responseCode = "404", description = "Route not found")
    public ResponseEntity<Route> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody RouteDTO routeDTO) {
        
        logger.info("Updating route with ID: {}", id);
        
        return routeRepository.findById(id)
                .map(route -> {
                    route.setFromCity(routeDTO.getFromCity());
                    route.setToCity(routeDTO.getToCity());
                    route.setDistance(routeDTO.getDistance());
                    route.setFixedPrice(routeDTO.getFixedPrice());
                    route.setIsPopular(routeDTO.getIsPopular());
                    
                    Route updatedRoute = routeRepository.save(route);
                    logger.info("Route updated successfully with ID: {}", id);
                    return ResponseEntity.ok(updatedRoute);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete route
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete route", description = "Delete a route by its ID")
    @ApiResponse(responseCode = "204", description = "Route deleted successfully")
    @ApiResponse(responseCode = "404", description = "Route not found")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        logger.info("Deleting route with ID: {}", id);
        
        if (routeRepository.existsById(id)) {
            routeRepository.deleteById(id);
            logger.info("Route deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.notFound().build();
    }
}

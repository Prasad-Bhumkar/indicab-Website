package com.indicab.controller;

import com.indicab.entity.Route;
import com.indicab.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/routes")
public class RouteController {


    @Autowired
    private RouteRepository routeRepository;

    @GetMapping("")
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRoute(@PathVariable Long id) {
        Optional<Route> route = routeRepository.findById(id);
        return route.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Route createRoute(@RequestBody Route route) {
        return routeRepository.save(route);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(@PathVariable Long id, @RequestBody Route routeDetails) {
        Optional<Route> optionalRoute = routeRepository.findById(id);
        if (!optionalRoute.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Route route = optionalRoute.get();
        route.setFromLocation(routeDetails.getFromLocation());
        route.setToLocation(routeDetails.getToLocation());
        route.setDistance(routeDetails.getDistance());
        route.setPrice(routeDetails.getPrice());
        route.setImage(routeDetails.getImage());
        route.setDescription(routeDetails.getDescription());

        Route updatedRoute = routeRepository.save(route);
        return ResponseEntity.ok(updatedRoute);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        if (!routeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        routeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

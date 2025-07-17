package com.indicab.controller;

import com.indicab.entity.ServiceCity;
import com.indicab.repository.ServiceCityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/service-cities")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceCityController {


    @Autowired
    private ServiceCityRepository serviceCityRepository;

    @GetMapping("")
    public Object getAllServiceCities() {
        List<ServiceCity> serviceCities = serviceCityRepository.findAll();
        // Extract city names
        List<String> cityNames = serviceCities.stream()
                .map(ServiceCity::getName)
                .toList();

        // Mock stats data
        var stats = new java.util.HashMap<String, Integer>();
        stats.put("citiesCovered", cityNames.size());
        stats.put("happyCustomers", 5000);
        stats.put("trustedDrivers", 1200);
        stats.put("support", 24);

        // Return response object
        var response = new java.util.HashMap<String, Object>();
        response.put("cities", cityNames);
        response.put("stats", stats);

        return response;
    }

    @GetMapping("/{name}")
    public ResponseEntity<ServiceCity> getServiceCityByName(@PathVariable String name) {
        Optional<ServiceCity> serviceCity = serviceCityRepository.findById(name);
        return serviceCity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ServiceCity createServiceCity(@RequestBody ServiceCity serviceCity) {
        return serviceCityRepository.save(serviceCity);
    }


    @PutMapping("/{name}")
    public ResponseEntity<ServiceCity> updateServiceCity(@PathVariable String name, @RequestBody ServiceCity serviceCityDetails) {
        Optional<ServiceCity> optionalServiceCity = serviceCityRepository.findById(name);
        if (!optionalServiceCity.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ServiceCity serviceCity = optionalServiceCity.get();
        serviceCity.setName(serviceCityDetails.getName());

        ServiceCity updatedServiceCity = serviceCityRepository.save(serviceCity);
        return ResponseEntity.ok(updatedServiceCity);
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteServiceCity(@PathVariable String name) {
        if (!serviceCityRepository.existsById(name)) {
            return ResponseEntity.notFound().build();
        }
        serviceCityRepository.deleteById(name);
        return ResponseEntity.noContent().build();
    }
}

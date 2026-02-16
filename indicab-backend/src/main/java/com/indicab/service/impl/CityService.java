package com.indicab.service.impl;

import com.indicab.dto.CityDTO;
import com.indicab.entity.City;
import com.indicab.repository.CityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for managing cities
 */
@Service
public class CityService {
    
    private static final Logger logger = LoggerFactory.getLogger(CityService.class);
    
    @Autowired
    private CityRepository cityRepository;
    
    /**
     * Create a new city
     */
    public City createCity(CityDTO cityDTO) {
        logger.info("Creating new city: {}", cityDTO.getName());
        
        // Check if city already exists
        if (cityRepository.findByName(cityDTO.getName()).isPresent()) {
            throw new IllegalArgumentException("City with name '" + cityDTO.getName() + "' already exists");
        }
        
        City city = new City(
            cityDTO.getName(),
            cityDTO.getLatitude(),
            cityDTO.getLongitude(),
            cityDTO.getIsActive()
        );
        
        City savedCity = cityRepository.save(city);
        logger.info("City created successfully with ID: {}", savedCity.getId());
        return savedCity;
    }
    
    /**
     * Get city by ID
     */
    public Optional<City> getCityById(Long id) {
        logger.debug("Fetching city with ID: {}", id);
        return cityRepository.findById(id);
    }
    
    /**
     * Get city by name
     */
    public Optional<City> getCityByName(String name) {
        logger.debug("Fetching city with name: {}", name);
        return cityRepository.findByName(name);
    }
    
    /**
     * Get all cities with pagination
     */
    public Page<City> getAllCities(Pageable pageable) {
        logger.debug("Fetching all cities");
        return cityRepository.findAll(pageable);
    }
    
    /**
     * Get active cities only
     */
    public Page<City> getActiveCities(Pageable pageable) {
        logger.debug("Fetching active cities");
        return cityRepository.findByIsActive(true, pageable);
    }
    
    /**
     * Update a city
     */
    public City updateCity(Long id, CityDTO cityDTO) {
        logger.info("Updating city with ID: {}", id);
        
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("City not found with ID: " + id));
        
        // Check if new name is already taken by another city
        if (!city.getName().equals(cityDTO.getName()) && 
            cityRepository.findByName(cityDTO.getName()).isPresent()) {
            throw new IllegalArgumentException("City with name '" + cityDTO.getName() + "' already exists");
        }
        
        city.setName(cityDTO.getName());
        city.setLatitude(cityDTO.getLatitude());
        city.setLongitude(cityDTO.getLongitude());
        city.setIsActive(cityDTO.getIsActive());
        
        City updatedCity = cityRepository.save(city);
        logger.info("City updated successfully with ID: {}", id);
        return updatedCity;
    }
    
    /**
     * Delete a city
     */
    public void deleteCity(Long id) {
        logger.info("Deleting city with ID: {}", id);
        
        if (!cityRepository.existsById(id)) {
            throw new IllegalArgumentException("City not found with ID: " + id);
        }
        
        cityRepository.deleteById(id);
        logger.info("City deleted successfully with ID: {}", id);
    }
    
    /**
     * Check if city exists
     */
    public boolean cityExists(Long id) {
        return cityRepository.existsById(id);
    }
}

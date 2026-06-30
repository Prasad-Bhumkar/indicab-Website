package com.indicab.service.impl;

import com.indicab.dto.VehicleDTO;
import com.indicab.entity.Vehicle;
import com.indicab.repository.VehicleRepository;
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

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService Tests")
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle testVehicle;
    private VehicleDTO vehicleDTO;

    @BeforeEach
    void setUp() {
        testVehicle = new Vehicle("Toyota Camry", "SEDAN", 4, 1.0,
                "https://example.com/camry.jpg", true);
        setId(testVehicle, 1L);
        testVehicle.setCreatedAt(LocalDateTime.now());
        testVehicle.setUpdatedAt(LocalDateTime.now());

        vehicleDTO = new VehicleDTO(null, "Honda Accord", "SEDAN", 4,
                1.2, "https://example.com/accord.jpg", true);
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
    @DisplayName("Should create vehicle successfully")
    void testCreateVehicle() {
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        Vehicle result = vehicleService.createVehicle(vehicleDTO);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Toyota Camry");
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should get vehicle by ID")
    void testGetVehicleById() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        Optional<Vehicle> result = vehicleService.getVehicleById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getType()).isEqualTo("SEDAN");
    }

    @Test
    @DisplayName("Should return empty when vehicle ID not found")
    void testGetVehicleByIdNotFound() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Vehicle> result = vehicleService.getVehicleById(999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get vehicle by type")
    void testGetVehicleByType() {
        when(vehicleRepository.findByType("SEDAN")).thenReturn(Optional.of(testVehicle));

        Optional<Vehicle> result = vehicleService.getVehicleByType("SEDAN");

        assertThat(result).isPresent();
        assertThat(result.get().getType()).isEqualTo("SEDAN");
    }

    @Test
    @DisplayName("Should return empty when vehicle type not found")
    void testGetVehicleByTypeNotFound() {
        when(vehicleRepository.findByType("SUV")).thenReturn(Optional.empty());

        Optional<Vehicle> result = vehicleService.getVehicleByType("SUV");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get all vehicles with pagination")
    void testGetAllVehicles() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, vehicleList.size());

        when(vehicleRepository.findAll(pageable)).thenReturn(vehiclePage);

        Page<Vehicle> result = vehicleService.getAllVehicles(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should get active vehicles")
    void testGetActiveVehicles() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, vehicleList.size());

        when(vehicleRepository.findByIsActive(true, pageable)).thenReturn(vehiclePage);

        Page<Vehicle> result = vehicleService.getActiveVehicles(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should update vehicle successfully")
    void testUpdateVehicle() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        Vehicle result = vehicleService.updateVehicle(1L, vehicleDTO);

        assertThat(result).isNotNull();
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent vehicle")
    void testUpdateVehicleNotFound() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.updateVehicle(999L, vehicleDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vehicle not found with ID: 999");
    }

    @Test
    @DisplayName("Should delete vehicle successfully")
    void testDeleteVehicle() {
        when(vehicleRepository.existsById(1L)).thenReturn(true);

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent vehicle")
    void testDeleteVehicleNotFound() {
        when(vehicleRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> vehicleService.deleteVehicle(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vehicle not found with ID: 999");
        verify(vehicleRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should check if vehicle exists")
    void testVehicleExists() {
        when(vehicleRepository.existsById(1L)).thenReturn(true);

        boolean result = vehicleService.vehicleExists(1L);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when vehicle does not exist")
    void testVehicleNotExists() {
        when(vehicleRepository.existsById(999L)).thenReturn(false);

        boolean result = vehicleService.vehicleExists(999L);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should bulk delete vehicles")
    void testBulkDeleteVehicles() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        ids.add(2L);

        vehicleService.bulkDeleteVehicles(ids);

        verify(vehicleRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("Should handle exception during bulk delete vehicles")
    void testBulkDeleteVehiclesException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);

        doThrow(new RuntimeException("Database error")).when(vehicleRepository).deleteAllById(ids);

        assertThatThrownBy(() -> vehicleService.bulkDeleteVehicles(ids))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to delete multiple vehicles");
    }

    @Test
    @DisplayName("Should bulk update vehicle status to active")
    void testBulkUpdateVehiclesStatusActive() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<Vehicle> vehicles = new ArrayList<>();
        vehicles.add(testVehicle);
        when(vehicleRepository.findAllById(ids)).thenReturn(vehicles);
        when(vehicleRepository.saveAll(vehicles)).thenReturn(vehicles);

        vehicleService.bulkUpdateVehiclesStatus(ids, "active");

        verify(vehicleRepository).saveAll(vehicles);
    }

    @Test
    @DisplayName("Should bulk update vehicle status to inactive")
    void testBulkUpdateVehiclesStatusInactive() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        List<Vehicle> vehicles = new ArrayList<>();
        vehicles.add(testVehicle);
        when(vehicleRepository.findAllById(ids)).thenReturn(vehicles);
        when(vehicleRepository.saveAll(vehicles)).thenReturn(vehicles);

        vehicleService.bulkUpdateVehiclesStatus(ids, "inactive");

        verify(vehicleRepository).saveAll(vehicles);
    }

    @Test
    @DisplayName("Should handle exception during bulk update vehicle status")
    void testBulkUpdateVehiclesStatusException() {
        List<Long> ids = new ArrayList<>();
        ids.add(1L);
        when(vehicleRepository.findAllById(ids)).thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> vehicleService.bulkUpdateVehiclesStatus(ids, "active"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to update status for multiple vehicles");
    }
}

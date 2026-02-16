package com.indicab.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class RouteDTO {
    
    private Long id;
    
    @NotBlank(message = "From city is required")
    private String fromCity;
    
    @NotBlank(message = "To city is required")
    private String toCity;
    
    @NotNull(message = "Distance is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private Double distance;
    
    @NotNull(message = "Fixed price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private Double fixedPrice;
    
    @NotNull(message = "Is popular field is required")
    private Boolean isPopular;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public RouteDTO() {}
    
    public RouteDTO(Long id, String fromCity, String toCity, Double distance, Double fixedPrice, Boolean isPopular) {
        this.id = id;
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.distance = distance;
        this.fixedPrice = fixedPrice;
        this.isPopular = isPopular;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFromCity() { return fromCity; }
    public void setFromCity(String fromCity) { this.fromCity = fromCity; }
    
    public String getToCity() { return toCity; }
    public void setToCity(String toCity) { this.toCity = toCity; }
    
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    
    public Double getFixedPrice() { return fixedPrice; }
    public void setFixedPrice(Double fixedPrice) { this.fixedPrice = fixedPrice; }
    
    public Boolean getIsPopular() { return isPopular; }
    public void setIsPopular(Boolean isPopular) { this.isPopular = isPopular; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

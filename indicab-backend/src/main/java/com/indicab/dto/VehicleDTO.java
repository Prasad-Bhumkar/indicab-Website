package com.indicab.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class VehicleDTO {
    
    private Long id;
    
    @NotBlank(message = "Vehicle name is required")
    @Size(min = 2, max = 50, message = "Vehicle name must be between 2 and 50 characters")
    private String name;
    
    @NotBlank(message = "Vehicle type is required")
    @Size(min = 2, max = 30, message = "Vehicle type must be between 2 and 30 characters")
    private String type;
    
    @NotNull(message = "Seat capacity is required")
    @Min(value = 1, message = "Seat capacity must be at least 1")
    @Max(value = 10, message = "Seat capacity cannot exceed 10")
    private Integer seatCapacity;
    
    @NotNull(message = "Price multiplier is required")
    @DecimalMin(value = "0.1", message = "Price multiplier must be at least 0.1")
    private Double priceMultiplier;
    
    private String imageUrl;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public VehicleDTO() {}
    
    public VehicleDTO(Long id, String name, String type, Integer seatCapacity, 
                     Double priceMultiplier, String imageUrl, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.seatCapacity = seatCapacity;
        this.priceMultiplier = priceMultiplier;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Integer getSeatCapacity() { return seatCapacity; }
    public void setSeatCapacity(Integer seatCapacity) { this.seatCapacity = seatCapacity; }
    
    public Double getPriceMultiplier() { return priceMultiplier; }
    public void setPriceMultiplier(Double priceMultiplier) { this.priceMultiplier = priceMultiplier; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

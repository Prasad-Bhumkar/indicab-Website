package com.indicab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class PackageDTO {
    
    private Long id;
    
    @NotBlank(message = "Package name is required")
    @Size(min = 3, max = 255, message = "Package name must be between 3 and 255 characters")
    private String name;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @NotBlank(message = "Package type is required")
    private String type; // hourly, regional, national, corporate
    
    @NotNull(message = "Base fare is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base fare must be greater than 0")
    private BigDecimal baseFare;
    
    @Size(max = 100, message = "Duration must not exceed 100 characters")
    private String duration; // e.g., "4 Hours", "2 Days"
    
    @Size(max = 100, message = "Validity must not exceed 100 characters")
    private String validity; // e.g., "7 Days", "1 Month"
    
    @DecimalMin(value = "0.0", message = "Discount percentage must be non-negative")
    private BigDecimal discountPercentage;
    
    @Size(max = 5000, message = "Features must not exceed 5000 characters")
    private String features; // JSON array or comma-separated list
    
    @Size(max = 2000, message = "Image URL must not exceed 2000 characters")
    private String imageUrl;
    
    private Boolean isActive = true;
    
    // Constructors
    public PackageDTO() {}
    
    public PackageDTO(String name, String description, String type, BigDecimal baseFare,
                      String duration, String validity, BigDecimal discountPercentage,
                      String features, String imageUrl, Boolean isActive) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.baseFare = baseFare;
        this.duration = duration;
        this.validity = validity;
        this.discountPercentage = discountPercentage;
        this.features = features;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public BigDecimal getBaseFare() {
        return baseFare;
    }
    
    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public String getValidity() {
        return validity;
    }
    
    public void setValidity(String validity) {
        this.validity = validity;
    }
    
    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public String getFeatures() {
        return features;
    }
    
    public void setFeatures(String features) {
        this.features = features;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

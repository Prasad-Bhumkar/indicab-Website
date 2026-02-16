package com.indicab.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "packages", indexes = {
    @Index(name = "idx_package_type", columnList = "package_type"),
    @Index(name = "idx_package_active", columnList = "is_active")
})
public class Package {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "package_type", nullable = false)
    private String type; // hourly, regional, national, corporate
    
    @Column(name = "base_fare", nullable = false)
    private BigDecimal baseFare;
    
    @Column(name = "duration")
    private String duration; // e.g., "4 Hours", "2 Days", "5 Days"
    
    @Column(name = "validity")
    private String validity; // e.g., "7 Days", "1 Month"
    
    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TEXT")
    private String features; // JSON or comma-separated features
    
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Package() {}
    
    public Package(String name, String description, String type, BigDecimal baseFare, 
                   String duration, String validity, BigDecimal discountPercentage, 
                   String features, String imageUrl, Boolean isActive) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.baseFare = baseFare;
        this.duration = duration;
        this.validity = validity;
        this.discountPercentage = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
        this.features = features;
        this.imageUrl = imageUrl;
        this.isActive = isActive != null ? isActive : true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
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
        this.discountPercentage = discountPercentage != null ? discountPercentage : BigDecimal.ZERO;
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
        this.isActive = isActive != null ? isActive : true;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

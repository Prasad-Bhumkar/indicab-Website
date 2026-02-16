package com.indicab.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes", indexes = {
    @Index(name = "idx_from_to", columnList = "from_city,to_city"),
    @Index(name = "idx_is_popular", columnList = "is_popular")
})
public class Route {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_city", nullable = false)
    private String fromCity;
    
    @Column(name = "to_city", nullable = false)
    private String toCity;
    
    @Column(nullable = false)
    private Double distance;
    
    @Column(name = "fixed_price", nullable = false)
    private Double fixedPrice;
    
    @Column(name = "is_popular", nullable = false)
    private Boolean isPopular = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public Route() {}
    
    public Route(String fromCity, String toCity, Double distance, Double fixedPrice, Boolean isPopular) {
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.distance = distance;
        this.fixedPrice = fixedPrice;
        this.isPopular = isPopular;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFromCity() {
        return fromCity;
    }
    
    public void setFromCity(String fromCity) {
        this.fromCity = fromCity;
    }
    
    public String getToCity() {
        return toCity;
    }
    
    public void setToCity(String toCity) {
        this.toCity = toCity;
    }
    
    public Double getDistance() {
        return distance;
    }
    
    public void setDistance(Double distance) {
        this.distance = distance;
    }
    
    public Double getFixedPrice() {
        return fixedPrice;
    }
    
    public void setFixedPrice(Double fixedPrice) {
        this.fixedPrice = fixedPrice;
    }
    
    public Boolean getIsPopular() {
        return isPopular;
    }
    
    public void setIsPopular(Boolean isPopular) {
        this.isPopular = isPopular;
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

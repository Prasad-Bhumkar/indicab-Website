package com.indicab.dto;

public class FareCalculationDTO {
    
    private String fromCity;
    private String toCity;
    private String vehicleType;
    private Double distance;
    private Double baseFare;
    private Double distanceCharge;
    private Double vehicleMultiplier;
    private Double taxes;
    private Double serviceFee;
    private Double totalFare;
    private Boolean isPopularRoute;
    private String calculationType; // "POPULAR_ROUTE" or "DISTANCE_BASED"
    
    public FareCalculationDTO() {}
    
    public FareCalculationDTO(String fromCity, String toCity, String vehicleType, Double distance,
                              Double baseFare, Double distanceCharge, Double vehicleMultiplier,
                              Double taxes, Double serviceFee, Double totalFare,
                              Boolean isPopularRoute, String calculationType) {
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.vehicleType = vehicleType;
        this.distance = distance;
        this.baseFare = baseFare;
        this.distanceCharge = distanceCharge;
        this.vehicleMultiplier = vehicleMultiplier;
        this.taxes = taxes;
        this.serviceFee = serviceFee;
        this.totalFare = totalFare;
        this.isPopularRoute = isPopularRoute;
        this.calculationType = calculationType;
    }
    
    // Getters and Setters
    public String getFromCity() { return fromCity; }
    public void setFromCity(String fromCity) { this.fromCity = fromCity; }
    
    public String getToCity() { return toCity; }
    public void setToCity(String toCity) { this.toCity = toCity; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    
    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }
    
    public Double getDistanceCharge() { return distanceCharge; }
    public void setDistanceCharge(Double distanceCharge) { this.distanceCharge = distanceCharge; }
    
    public Double getVehicleMultiplier() { return vehicleMultiplier; }
    public void setVehicleMultiplier(Double vehicleMultiplier) { this.vehicleMultiplier = vehicleMultiplier; }
    
    public Double getTaxes() { return taxes; }
    public void setTaxes(Double taxes) { this.taxes = taxes; }
    
    public Double getServiceFee() { return serviceFee; }
    public void setServiceFee(Double serviceFee) { this.serviceFee = serviceFee; }
    
    public Double getTotalFare() { return totalFare; }
    public void setTotalFare(Double totalFare) { this.totalFare = totalFare; }
    
    public Boolean getIsPopularRoute() { return isPopularRoute; }
    public void setIsPopularRoute(Boolean isPopularRoute) { this.isPopularRoute = isPopularRoute; }
    
    public String getCalculationType() { return calculationType; }
    public void setCalculationType(String calculationType) { this.calculationType = calculationType; }
}

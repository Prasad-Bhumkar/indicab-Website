package com.indicab.entity;

import java.io.Serializable;
import java.util.Objects;

public class RouteId implements Serializable {

    private static final long serialVersionUID = 1L;

    private String fromLocation;
    private String toLocation;

    public RouteId() {}

    public RouteId(String fromLocation, String toLocation) {
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RouteId)) return false;
        RouteId routeId = (RouteId) o;
        return Objects.equals(fromLocation, routeId.fromLocation) &&
               Objects.equals(toLocation, routeId.toLocation);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromLocation, toLocation);
    }
}

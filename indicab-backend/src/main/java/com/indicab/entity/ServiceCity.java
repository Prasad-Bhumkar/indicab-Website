package com.indicab.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class ServiceCity {

    @Id
    private String name;

    public ServiceCity() {}

    public ServiceCity(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

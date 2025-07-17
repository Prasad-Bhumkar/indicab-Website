package com.indicab.repository;

import com.indicab.entity.ServiceCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceCityRepository extends JpaRepository<ServiceCity, String> {
}

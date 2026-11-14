package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.poserp.models.entities.Unit;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    
}
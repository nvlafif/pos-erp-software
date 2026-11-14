package com.poserp.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.poserp.models.entities.Unit;
import com.poserp.repositories.UnitRepository;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public List<Unit> findAll() {
        return unitRepository.findAll();
    }

    public Unit findById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found : " + id));
    }

    public Unit create(Unit unit) {
        return unitRepository.save(unit);
    }

    public Unit update(Long id, Unit unitDetails) {
        Unit existingUnit = findById(id);
        existingUnit.setName(unitDetails.getName());
        return unitRepository.save(existingUnit);
    }

    public void delete(Long id) {
        Unit existingUnit = findById(id);
        unitRepository.delete(existingUnit);
    }
}
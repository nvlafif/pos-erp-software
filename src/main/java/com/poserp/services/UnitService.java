package com.poserp.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Unit create(Unit unit) {
        String cleanName = validateAndTrimName(unit.getName());

        if (unitRepository.existsByNameIgnoreCase(cleanName)) {
            throw new IllegalArgumentException("Unit already exists : " + cleanName);
        }

        unitRepository.resetSequence();
        unit.setName(cleanName);
        return unitRepository.save(unit);
    }

    @Transactional
    public Unit update(Long id, Unit unitDetails) {
        Unit existingUnit = findById(id);
        String cleanName = validateAndTrimName(unitDetails.getName());

        if (unitRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new IllegalArgumentException("Unit already exists : " + cleanName);
        }

        existingUnit.setName(cleanName);
        return unitRepository.save(existingUnit);
    }

    @Transactional
    public void delete(Long id) {
        Unit existingUnit = findById(id);
        unitRepository.delete(existingUnit);
        unitRepository.flush();
        unitRepository.resetSequence();
    }

    private String validateAndTrimName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Unit name cannot be empty");
        }
        return name.trim();
    }
}
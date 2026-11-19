package com.poserp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.poserp.models.entities.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query(value = "SELECT setval(pg_get_serial_sequence('units', 'id'), COALESCE((SELECT MAX(id) FROM units), 0) + 1, false)", nativeQuery = true)
    Long resetSequence();
}
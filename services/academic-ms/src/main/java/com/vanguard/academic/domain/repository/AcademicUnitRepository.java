package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.AcademicUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicUnitRepository extends JpaRepository<AcademicUnit, Long> {
    Optional<AcademicUnit> findByName(String name);
    boolean existsByName(String name);
    List<AcademicUnit> findByNameContainingIgnoreCase(String name);
}

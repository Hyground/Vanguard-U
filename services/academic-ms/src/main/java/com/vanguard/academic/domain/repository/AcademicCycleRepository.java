package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.AcademicCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicCycleRepository extends JpaRepository<AcademicCycle, Long> {
    Optional<AcademicCycle> findByYear(Integer year);
    Optional<AcademicCycle> findByActiveTrue();
    boolean existsByYear(Integer year);
}

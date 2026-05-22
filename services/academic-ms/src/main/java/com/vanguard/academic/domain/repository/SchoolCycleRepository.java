package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.SchoolCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolCycleRepository extends JpaRepository<SchoolCycle, Long> {
    Optional<SchoolCycle> findByYear(Integer year);
    Optional<SchoolCycle> findByActiveTrue();
    long countByActiveTrue();
    boolean existsByYear(Integer year);
}

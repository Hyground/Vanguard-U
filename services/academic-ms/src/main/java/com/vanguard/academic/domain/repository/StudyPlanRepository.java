package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    Optional<StudyPlan> findByName(String name);
    boolean existsByName(String name);
    List<StudyPlan> findByNameContainingIgnoreCase(String name);
}

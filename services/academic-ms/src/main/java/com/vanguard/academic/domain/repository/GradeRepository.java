package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByCareerId(Long careerId);
    Optional<Grade> findByNameAndCareerId(String name, Long careerId);
    boolean existsByNameAndCareerId(String name, Long careerId);
    List<Grade> findByNameContainingIgnoreCase(String name);
}

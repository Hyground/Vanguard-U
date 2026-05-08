package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByMajorId(Long majorId);
    Optional<Grade> findByNameAndMajorId(String name, Long majorId);
    boolean existsByNameAndMajorId(String name, Long majorId);
    List<Grade> findByNameContainingIgnoreCase(String name);
}

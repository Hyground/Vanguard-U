package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.BimonthlyUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BimonthlyUnitRepository extends JpaRepository<BimonthlyUnit, Long> {
    Optional<BimonthlyUnit> findByName(String name);
    boolean existsByName(String name);
    List<BimonthlyUnit> findByNameContainingIgnoreCase(String name);
}

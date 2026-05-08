package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    Optional<Shift> findByName(String name);
    boolean existsByName(String name);
    List<Shift> findByNameContainingIgnoreCase(String name);
}

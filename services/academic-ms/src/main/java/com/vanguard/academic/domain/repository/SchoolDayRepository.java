package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.SchoolDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolDayRepository extends JpaRepository<SchoolDay, Long> {
    Optional<SchoolDay> findByName(String name);
    boolean existsByName(String name);
    List<SchoolDay> findByNameContainingIgnoreCase(String name);
}

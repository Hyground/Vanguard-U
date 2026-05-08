package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    Optional<Section> findByName(String name);
    boolean existsByName(String name);
    List<Section> findByNameContainingIgnoreCase(String name);
}

package com.vanguard.academic.domain.repository;

import com.vanguard.academic.domain.model.Teacher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByCui(String cui);
    Optional<Teacher> findByUserId(Long userId);
    boolean existsByCui(String cui);
    boolean existsByUserId(Long userId);
    Page<Teacher> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName, Pageable pageable);
}

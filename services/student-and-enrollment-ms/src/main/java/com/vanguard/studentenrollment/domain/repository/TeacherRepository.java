package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Teacher;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {

    boolean existsByCui(String cui);

    Optional<Teacher> findByCui(String cui);
}

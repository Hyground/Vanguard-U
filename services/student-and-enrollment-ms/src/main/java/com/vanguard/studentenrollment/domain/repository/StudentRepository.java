package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    boolean existsByCui(String cui);

    boolean existsByPersonalCode(String personalCode);

    Optional<Student> findByCui(String cui);

    Optional<Student> findByPersonalCode(String personalCode);

    List<Student> findByUserId(Integer userId);

    List<Student> findByTutor_Id(Integer tutorId);

    boolean existsByTutor_Id(Integer tutorId);
}

package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Tutor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, Integer> {

    boolean existsByCui(String cui);

    Optional<Tutor> findByCui(String cui);
}

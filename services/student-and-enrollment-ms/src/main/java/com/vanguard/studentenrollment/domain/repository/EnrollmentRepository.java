package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Enrollment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    List<Enrollment> findByStudent_Id(Integer studentId);

    List<Enrollment> findByCycleId(Integer cycleId);

    List<Enrollment> findByGradeIdAndSectionIdAndCycleId(Integer gradeId, Integer sectionId, Integer cycleId);
}

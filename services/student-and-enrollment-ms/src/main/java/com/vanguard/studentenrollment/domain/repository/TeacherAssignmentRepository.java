package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Integer> {

    List<TeacherAssignment> findByTeacherId(Integer teacherId);

    List<TeacherAssignment> findByGradeIdAndSectionId(Integer gradeId, Integer sectionId);
}

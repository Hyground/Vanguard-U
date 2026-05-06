package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Integer> {

    List<TeacherAssignment> findByTeacher_Id(Integer teacherId);

    List<TeacherAssignment> findByGradeIdAndSectionId(Integer gradeId, Integer sectionId);

    boolean existsByTeacher_IdAndCourseIdAndGradeIdAndSectionId(
            Integer teacherId,
            Integer courseId,
            Integer gradeId,
            Integer sectionId
    );
}

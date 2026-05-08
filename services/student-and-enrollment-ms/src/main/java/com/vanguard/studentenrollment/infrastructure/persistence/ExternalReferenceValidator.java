package com.vanguard.studentenrollment.infrastructure.persistence;

import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ExternalReferenceValidator {

    private final JdbcTemplate jdbcTemplate;

    public ExternalReferenceValidator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void ensureUserExists(Integer userId) {
        ensureExists("users", "id_user", userId, "User");
    }

    public void ensureTeacherExists(Integer teacherId) {
        ensureExists("teachers", "id_teacher", teacherId, "Teacher");
    }

    public void ensureCourseExists(Integer courseId) {
        ensureExists("courses", "id_course", courseId, "Course");
    }

    public void ensureGradeExists(Integer gradeId) {
        ensureExists("grades", "id_grade", gradeId, "Grade");
    }

    public void ensureSectionExists(Integer sectionId) {
        ensureExists("sections", "id_section", sectionId, "Section");
    }

    public void ensureStudyPlanExists(Integer planId) {
        ensureExists("study_plans", "id_plan", planId, "Study plan");
    }

    public void ensureShiftExists(Integer shiftId) {
        ensureExists("shifts", "id_shift", shiftId, "Shift");
    }

    public void ensureSchoolCycleExists(Integer cycleId) {
        ensureExists("school_cycle", "id_cycle", cycleId, "School cycle");
    }

    public void ensureClassroomExists(Integer classroomId) {
        ensureExists("classrooms", "id_classroom", classroomId, "Classroom");
    }

    public void ensureBimonthlyUnitExists(Integer unitId) {
        ensureExists("bimonthly_units", "id_unit", unitId, "Bimonthly unit");
    }

    private void ensureExists(String table, String idColumn, Integer id, String label) {
        if (id == null) {
            return;
        }

        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM " + table + " WHERE " + idColumn + " = ?)",
                Boolean.class,
                id
        );

        if (!Boolean.TRUE.equals(exists)) {
            throw new ResourceNotFoundException(label + " not found with id: " + id);
        }
    }
}

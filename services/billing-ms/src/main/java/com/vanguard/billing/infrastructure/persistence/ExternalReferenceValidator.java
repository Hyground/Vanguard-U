package com.vanguard.billing.infrastructure.persistence;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ExternalReferenceValidator {

    private final JdbcTemplate jdbcTemplate;

    public ExternalReferenceValidator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void ensureStudentExists(Integer studentId) {
        ensureExists("students", "id_student", studentId, "Student");
    }

    public void ensureUserExists(Integer userId) {
        ensureExists("users", "id_user", userId, "User");
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
            throw new IllegalArgumentException(label + " not found with id: " + id);
        }
    }
}

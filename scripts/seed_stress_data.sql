-- Vanguard-U stress seed data
-- Execute after sql.txt.
--
-- Goal:
-- - Fill PostgreSQL with a considerable but controlled amount of data.
-- - Useful for testing Redis cache, read replica, list endpoints, reports and load.
--
-- Default volume:
-- - 80 teachers
-- - 500 tutors
-- - 5,000 students
-- - 5,000 enrollments
-- - 240 teacher assignments
-- - 960 activities
-- - roughly 200,000 grade records
-- - roughly 250,000 attendance rows
-- - 5,000 payments
--
-- Demo password for generated users:
--   Demo123!
--
-- Important:
-- - Uses PostgreSQL generate_series().
-- - Does not use DROP, TRUNCATE or DELETE.
-- - Uses unique prefixes so it can coexist with demo data.
-- - Re-running the script should not duplicate the main generated records.
-- - This is for testing, not production.

BEGIN;

-- =========================================================
-- Roles
-- =========================================================

INSERT INTO roles (role_name)
VALUES ('ADMIN'), ('TEACHER'), ('STUDENT'), ('TUTOR')
ON CONFLICT (role_name) DO NOTHING;

-- =========================================================
-- Base catalogs required by generated data
-- =========================================================

INSERT INTO classrooms (room_code, capacity)
SELECT 'LOAD-' || LPAD(gs::text, 3, '0'), 30 + (gs % 20)
FROM generate_series(1, 40) gs
ON CONFLICT (room_code) DO NOTHING;

INSERT INTO study_plans (plan_name)
SELECT name
FROM (
    VALUES ('Carga Plan 2026'), ('Carga Plan Tecnico 2026')
) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM study_plans sp WHERE sp.plan_name = seed.name
);

INSERT INTO shifts (shift_name)
SELECT name
FROM (
    VALUES ('Carga Matutina'), ('Carga Vespertina')
) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM shifts sh WHERE sh.shift_name = seed.name
);

INSERT INTO school_cycle (year, status)
VALUES (2026, TRUE)
ON CONFLICT (year) DO NOTHING;

INSERT INTO majors (major_name)
SELECT name
FROM (
    VALUES
        ('Carga Ciencias y Letras'),
        ('Carga Computacion'),
        ('Carga Contabilidad')
) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM majors m WHERE m.major_name = seed.name
);

INSERT INTO grades (grade_name, id_major)
SELECT seed.grade_name, majors.id_major
FROM (
    VALUES
        ('Carga Primero', 'Carga Ciencias y Letras'),
        ('Carga Segundo', 'Carga Ciencias y Letras'),
        ('Carga Tercero', 'Carga Ciencias y Letras'),
        ('Carga Cuarto Computacion', 'Carga Computacion'),
        ('Carga Quinto Computacion', 'Carga Computacion'),
        ('Carga Cuarto Contabilidad', 'Carga Contabilidad'),
        ('Carga Quinto Contabilidad', 'Carga Contabilidad'),
        ('Carga Sexto Contabilidad', 'Carga Contabilidad')
) seed(grade_name, major_name)
JOIN majors ON majors.major_name = seed.major_name
WHERE NOT EXISTS (
    SELECT 1
    FROM grades g
    WHERE g.grade_name = seed.grade_name
      AND g.id_major = majors.id_major
);

INSERT INTO sections (section_name)
SELECT name
FROM (VALUES ('A'), ('B'), ('C')) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM sections s WHERE s.section_name = seed.name
);

INSERT INTO courses (course_code, course_name)
VALUES
    ('L-MAT', 'Carga Matematica'),
    ('L-COM', 'Carga Comunicacion'),
    ('L-SCI', 'Carga Ciencias'),
    ('L-SOC', 'Carga Sociales'),
    ('L-ENG', 'Carga Ingles'),
    ('L-TEC', 'Carga Tecnologia'),
    ('L-ACC', 'Carga Contabilidad'),
    ('L-PRO', 'Carga Programacion')
ON CONFLICT (course_code) DO NOTHING;

INSERT INTO bimonthly_units (unit_name)
SELECT name
FROM (
    VALUES ('Carga Bimestre 1'), ('Carga Bimestre 2'), ('Carga Bimestre 3'), ('Carga Bimestre 4')
) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM bimonthly_units bu WHERE bu.unit_name = seed.name
);

INSERT INTO payment_methods (method_name)
SELECT name
FROM (
    VALUES ('Carga Efectivo'), ('Carga Transferencia')
) seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM payment_methods pm WHERE pm.method_name = seed.name
);

-- =========================================================
-- Users: 1 admin, 80 teachers, 500 tutors, 5,000 students
-- =========================================================

WITH demo_password AS (
    SELECT '$2a$10$dzy1N2GiIjlNnX4TrRzuTu9eXrZWrLJME6rLk3uhQIwjLeS9DlOly'::text AS hash
)
INSERT INTO users (username, password_hash, id_role, status)
SELECT seed.username, demo_password.hash, roles.id_role, TRUE
FROM (
    SELECT 'load_admin' AS username, 'ADMIN' AS role_name
    UNION ALL
    SELECT 'load_teacher' || gs, 'TEACHER' FROM generate_series(1, 80) gs
    UNION ALL
    SELECT 'load_tutor' || gs, 'TUTOR' FROM generate_series(1, 500) gs
    UNION ALL
    SELECT 'load_student' || gs, 'STUDENT' FROM generate_series(1, 5000) gs
) seed
JOIN roles ON roles.role_name = seed.role_name
CROSS JOIN demo_password
ON CONFLICT (username) DO NOTHING;

-- =========================================================
-- Profiles
-- =========================================================

INSERT INTO teachers (cui, first_name, last_name, email, id_user)
SELECT '91' || LPAD(gs::text, 11, '0'),
       'CargaDocente',
       'Numero ' || gs,
       'load_teacher' || gs || '@vanguard.edu',
       users.id_user
FROM generate_series(1, 80) gs
JOIN users ON users.username = 'load_teacher' || gs
ON CONFLICT (cui) DO NOTHING;

INSERT INTO tutor (cui, first_name, last_name, id_user)
SELECT '92' || LPAD(gs::text, 11, '0'),
       'CargaTutor',
       'Numero ' || gs,
       users.id_user
FROM generate_series(1, 500) gs
JOIN users ON users.username = 'load_tutor' || gs
ON CONFLICT (cui) DO NOTHING;

INSERT INTO students (personal_code, cui, first_name, last_name, id_tutor, id_user)
SELECT 'LOAD-2026-' || LPAD(gs::text, 6, '0'),
       '93' || LPAD(gs::text, 11, '0'),
       'CargaEstudiante',
       'Numero ' || gs,
       tutor.id_tutor,
       users.id_user
FROM generate_series(1, 5000) gs
JOIN users ON users.username = 'load_student' || gs
JOIN tutor ON tutor.cui = '92' || LPAD((((gs - 1) % 500) + 1)::text, 11, '0')
ON CONFLICT (personal_code) DO NOTHING;

-- =========================================================
-- Enrollments
-- =========================================================

INSERT INTO enrollments (id_student, id_grade, id_section, id_plan, id_shift, id_cycle)
SELECT students.id_student,
       grades.id_grade,
       sections.id_section,
       study_plans.id_plan,
       shifts.id_shift,
       school_cycle.id_cycle
FROM students
JOIN grades ON grades.grade_name = CASE ((students.id_student - 1) % 8)
    WHEN 0 THEN 'Carga Primero'
    WHEN 1 THEN 'Carga Segundo'
    WHEN 2 THEN 'Carga Tercero'
    WHEN 3 THEN 'Carga Cuarto Computacion'
    WHEN 4 THEN 'Carga Quinto Computacion'
    WHEN 5 THEN 'Carga Cuarto Contabilidad'
    WHEN 6 THEN 'Carga Quinto Contabilidad'
    ELSE 'Carga Sexto Contabilidad'
END
JOIN sections ON sections.section_name = CASE ((students.id_student - 1) % 3)
    WHEN 0 THEN 'A'
    WHEN 1 THEN 'B'
    ELSE 'C'
END
JOIN study_plans ON study_plans.plan_name = CASE
    WHEN students.id_student % 2 = 0 THEN 'Carga Plan 2026'
    ELSE 'Carga Plan Tecnico 2026'
END
JOIN shifts ON shifts.shift_name = CASE
    WHEN students.id_student % 2 = 0 THEN 'Carga Matutina'
    ELSE 'Carga Vespertina'
END
JOIN school_cycle ON school_cycle.year = 2026
WHERE students.personal_code LIKE 'LOAD-2026-%'
  AND NOT EXISTS (
      SELECT 1
      FROM enrollments e
      WHERE e.id_student = students.id_student
        AND e.id_cycle = school_cycle.id_cycle
  );

-- =========================================================
-- Teacher assignments
-- 240 assignments: enough for reports without exploding too much.
-- =========================================================

WITH assignment_seed AS (
    SELECT teachers.id_teacher,
           courses.id_course,
           grades.id_grade,
           sections.id_section,
           ROW_NUMBER() OVER (
               ORDER BY teachers.id_teacher, courses.id_course, grades.id_grade, sections.id_section
           ) AS rn
    FROM teachers
    JOIN courses ON courses.course_code IN ('L-MAT', 'L-COM', 'L-SCI', 'L-SOC', 'L-ENG', 'L-TEC', 'L-ACC', 'L-PRO')
    JOIN grades ON grades.grade_name LIKE 'Carga %'
    JOIN sections ON sections.section_name IN ('A', 'B', 'C')
    WHERE teachers.cui LIKE '91%'
)
INSERT INTO teacher_assignments (id_teacher, id_course, id_grade, id_section)
SELECT id_teacher, id_course, id_grade, id_section
FROM assignment_seed
WHERE rn <= 240
  AND NOT EXISTS (
      SELECT 1
      FROM teacher_assignments ta
      WHERE ta.id_teacher = assignment_seed.id_teacher
        AND ta.id_course = assignment_seed.id_course
        AND ta.id_grade = assignment_seed.id_grade
        AND ta.id_section = assignment_seed.id_section
  );

-- =========================================================
-- Schedules
-- =========================================================

INSERT INTO schedules (id_teacher_assignment, id_classroom, day_of_week, start_time, end_time)
SELECT teacher_assignments.id_teacher_assignment,
       classrooms.id_classroom,
       CASE ((teacher_assignments.id_teacher_assignment - 1) % 5)
           WHEN 0 THEN 'MONDAY'
           WHEN 1 THEN 'TUESDAY'
           WHEN 2 THEN 'WEDNESDAY'
           WHEN 3 THEN 'THURSDAY'
           ELSE 'FRIDAY'
       END,
       (TIME '07:00' + (((teacher_assignments.id_teacher_assignment - 1) % 8) * INTERVAL '45 minutes'))::time,
       (TIME '07:40' + (((teacher_assignments.id_teacher_assignment - 1) % 8) * INTERVAL '45 minutes'))::time
FROM teacher_assignments
JOIN classrooms ON classrooms.room_code = 'LOAD-' || LPAD((1 + ((teacher_assignments.id_teacher_assignment - 1) % 40))::text, 3, '0')
WHERE NOT EXISTS (
    SELECT 1 FROM schedules s WHERE s.id_teacher_assignment = teacher_assignments.id_teacher_assignment
);

-- =========================================================
-- Activities
-- 4 activities per teacher assignment.
-- =========================================================

INSERT INTO activities (id_teacher_assignment, id_unit, activity_name, weight)
SELECT teacher_assignments.id_teacher_assignment,
       bimonthly_units.id_unit,
       'Carga Actividad ' || bimonthly_units.unit_name,
       25.00
FROM teacher_assignments
JOIN bimonthly_units ON bimonthly_units.unit_name LIKE 'Carga Bimestre%'
WHERE NOT EXISTS (
    SELECT 1
    FROM activities a
    WHERE a.id_teacher_assignment = teacher_assignments.id_teacher_assignment
      AND a.id_unit = bimonthly_units.id_unit
      AND a.activity_name = 'Carga Actividad ' || bimonthly_units.unit_name
);

-- =========================================================
-- Grade records
-- Creates many rows by matching each student to assignments in their grade/section.
-- Expected order: about 200k rows depending on existing assignment distribution.
-- =========================================================

INSERT INTO grades_records (id_student, id_activity, score_obtained)
SELECT students.id_student,
       activities.id_activity,
       60 + ((students.id_student + activities.id_activity) % 41)
FROM students
JOIN enrollments ON enrollments.id_student = students.id_student
JOIN teacher_assignments ON teacher_assignments.id_grade = enrollments.id_grade
                        AND teacher_assignments.id_section = enrollments.id_section
JOIN activities ON activities.id_teacher_assignment = teacher_assignments.id_teacher_assignment
WHERE students.personal_code LIKE 'LOAD-2026-%'
  AND activities.activity_name LIKE 'Carga Actividad%'
  AND NOT EXISTS (
      SELECT 1
      FROM grades_records gr
      WHERE gr.id_student = students.id_student
        AND gr.id_activity = activities.id_activity
  );

-- =========================================================
-- Attendance
-- 10 school days per student per matching assignment.
-- Expected order: about 250k rows depending on assignment distribution.
-- =========================================================

INSERT INTO attendance (id_student, id_teacher_assignment, attendance_date, status)
SELECT students.id_student,
       teacher_assignments.id_teacher_assignment,
       (DATE '2026-05-01' + day_offset)::date,
       CASE
           WHEN ((students.id_student + teacher_assignments.id_teacher_assignment + day_offset) % 19) = 0 THEN 'ABSENT'
           WHEN ((students.id_student + day_offset) % 11) = 0 THEN 'LATE'
           ELSE 'PRESENT'
       END
FROM students
JOIN enrollments ON enrollments.id_student = students.id_student
JOIN teacher_assignments ON teacher_assignments.id_grade = enrollments.id_grade
                        AND teacher_assignments.id_section = enrollments.id_section
CROSS JOIN generate_series(0, 9) AS days(day_offset)
WHERE students.personal_code LIKE 'LOAD-2026-%'
  AND NOT EXISTS (
      SELECT 1
      FROM attendance att
      WHERE att.id_student = students.id_student
        AND att.id_teacher_assignment = teacher_assignments.id_teacher_assignment
        AND att.attendance_date = (DATE '2026-05-01' + day_offset)::date
  );

-- =========================================================
-- Payments
-- =========================================================

INSERT INTO payments (id_student, id_method, id_user_issuer, id_user_payer, amount)
SELECT students.id_student,
       payment_methods.id_method,
       issuer.id_user,
       payer.id_user,
       100.00 + ((students.id_student % 20) * 10.00)
FROM students
JOIN payment_methods ON payment_methods.method_name = CASE
    WHEN students.id_student % 2 = 0 THEN 'Carga Transferencia'
    ELSE 'Carga Efectivo'
END
JOIN users issuer ON issuer.username = 'load_admin'
JOIN tutor ON tutor.id_tutor = students.id_tutor
JOIN users payer ON payer.id_user = tutor.id_user
WHERE students.personal_code LIKE 'LOAD-2026-%'
  AND NOT EXISTS (
      SELECT 1
      FROM payments p
      WHERE p.id_student = students.id_student
        AND p.amount = 100.00 + ((students.id_student % 20) * 10.00)
  );

-- =========================================================
-- Verification
-- =========================================================

SELECT 'load_users' AS metric, COUNT(*) AS total
FROM users
WHERE username LIKE 'load_%'
UNION ALL
SELECT 'load_teachers', COUNT(*) FROM teachers WHERE cui LIKE '91%'
UNION ALL
SELECT 'load_tutors', COUNT(*) FROM tutor WHERE cui LIKE '92%'
UNION ALL
SELECT 'load_students', COUNT(*) FROM students WHERE personal_code LIKE 'LOAD-2026-%'
UNION ALL
SELECT 'load_enrollments', COUNT(*)
FROM enrollments e
JOIN students s ON s.id_student = e.id_student
WHERE s.personal_code LIKE 'LOAD-2026-%'
UNION ALL
SELECT 'load_teacher_assignments', COUNT(*)
FROM teacher_assignments ta
JOIN teachers t ON t.id_teacher = ta.id_teacher
WHERE t.cui LIKE '91%'
UNION ALL
SELECT 'load_activities', COUNT(*) FROM activities WHERE activity_name LIKE 'Carga Actividad%'
UNION ALL
SELECT 'load_grade_records', COUNT(*)
FROM grades_records gr
JOIN students s ON s.id_student = gr.id_student
WHERE s.personal_code LIKE 'LOAD-2026-%'
UNION ALL
SELECT 'load_attendance', COUNT(*)
FROM attendance att
JOIN students s ON s.id_student = att.id_student
WHERE s.personal_code LIKE 'LOAD-2026-%'
UNION ALL
SELECT 'load_payments', COUNT(*)
FROM payments p
JOIN students s ON s.id_student = p.id_student
WHERE s.personal_code LIKE 'LOAD-2026-%'
ORDER BY metric;

COMMIT;

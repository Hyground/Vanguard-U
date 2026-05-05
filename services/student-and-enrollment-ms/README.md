# Microservicio de Estudiantes e Inscripciones

Este microservicio gestiona los ciclos de vida de estudiantes y docentes, incluyendo inscripciones, asignaciones de cursos, horarios, calificaciones y asistencia.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **PostgreSQL**
- **Feign Client** (para comunicación entre servicios con `academic-ms` y `users-ms`)

## Database Schema (English)

```sql
CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    user_id INTEGER -- References users-ms.users
);

CREATE TABLE guardians (
    guardian_id SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_id INTEGER -- References users-ms.users
);

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    personal_code VARCHAR(20) UNIQUE NOT NULL,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    guardian_id INTEGER REFERENCES guardians(guardian_id),
    user_id INTEGER -- References users-ms.users
);

CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    grade_id INTEGER, -- References academic-ms.grades
    section_id INTEGER, -- References academic-ms.sections
    plan_id INTEGER, -- References academic-ms.study_plans
    day_id INTEGER, -- References academic-ms.school_days
    cycle_id INTEGER, -- References academic-ms.academic_cycles
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_assignments (
    assignment_id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(teacher_id),
    course_id INTEGER, -- References academic-ms.courses
    grade_id INTEGER, -- References academic-ms.grades
    section_id INTEGER -- References academic-ms.sections
);

CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES teacher_assignments(assignment_id),
    classroom_id INTEGER, -- References academic-ms.classrooms
    weekday VARCHAR(15),
    start_time TIME,
    end_time TIME
);

CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES teacher_assignments(assignment_id),
    unit_id INTEGER, -- References academic-ms.academic_units
    activity_name VARCHAR(100),
    weight DECIMAL(5,2)
);

CREATE TABLE student_grades (
    grade_record_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    activity_id INTEGER REFERENCES activities(activity_id),
    score_obtained DECIMAL(5,2)
);

CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    assignment_id INTEGER REFERENCES teacher_assignments(assignment_id),
    attendance_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20)
);
```

## Suggested Endpoints

### Student & Guardian Controllers
- `POST /api/v1/students` - Registrar un nuevo estudiante.
- `GET /api/v1/students/{id}` - Obtener perfil del estudiante.
- `POST /api/v1/guardians` - Registrar un tutor (guardian).

### Enrollment Controller
- `POST /api/v1/enrollments` - Inscribir a un estudiante en un grado/sección/ciclo.
- `GET /api/v1/enrollments/student/{studentId}` - Obtener historial de inscripciones del estudiante.

### Gestión Académica (Perspectiva Docente)
- `POST /api/v1/teacher-assignments` - Asignar un docente a un curso/grado/sección.
- `POST /api/v1/activities` - Crear una nueva actividad para un curso.
- `POST /api/v1/grades` - Registrar una nota para un estudiante.
- `POST /api/v1/attendance` - Marcar asistencia.

## Suggested DTOs
- `StudentDTO` (id, personalCode, firstName, lastName, guardianId)
- `EnrollmentRequestDTO` (studentId, gradeId, sectionId, cycleId)
- `GradeSubmissionDTO` (studentId, activityId, score)
- `TeacherAssignmentDTO` (teacherId, courseId, gradeId, sectionId)

## Suggested Sprints

### Sprint 1: Entidades y Actores
- Implementar CRUD de Estudiantes, Tutores y Docentes.
- Integración con `users-ms` para vincular `user_id`.

### Sprint 2: Inscripciones y Asignaciones
- Implementar lógica de Inscripciones.
- Implementar Asignaciones de Docentes a cursos y secciones.

### Sprint 3: Operación Académica
- Implementar Horarios (Schedules).
- Implementar Actividades y sistema de Calificaciones.
- Implementar seguimiento de Asistencia.

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*

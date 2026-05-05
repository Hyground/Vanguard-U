# Student & Enrollment Microservice

This microservice handles student and teacher life cycles, including enrollments, course assignments, scheduling, grading, and attendance.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **PostgreSQL**
- **Feign Client** (for cross-service communication with `academic-ms` and `users-ms`)

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
- `POST /api/v1/students` - Register a new student.
- `GET /api/v1/students/{id}` - Get student profile.
- `POST /api/v1/guardians` - Register a guardian.

### Enrollment Controller
- `POST /api/v1/enrollments` - Enroll a student in a grade/section/cycle.
- `GET /api/v1/enrollments/student/{studentId}` - Get student's enrollment history.

### Academic Management (Teacher Perspective)
- `POST /api/v1/teacher-assignments` - Assign a teacher to a course/grade/section.
- `POST /api/v1/activities` - Create a new activity for a course.
- `POST /api/v1/grades` - Register a score for a student.
- `POST /api/v1/attendance` - Mark attendance.

## Suggested DTOs
- `StudentDTO` (id, personalCode, firstName, lastName, guardianId)
- `EnrollmentRequestDTO` (studentId, gradeId, sectionId, cycleId)
- `GradeSubmissionDTO` (studentId, activityId, score)
- `TeacherAssignmentDTO` (teacherId, courseId, gradeId, sectionId)

## Suggested Sprints

### Sprint 1: Entities & Actros
- Implement Students, Guardians, and Teachers CRUD.
- Integration with `users-ms` to link `user_id`.

### Sprint 2: Enrollments & Assignments
- Implement Enrollment logic.
- Implement Teacher Assignments to courses and sections.

### Sprint 3: Academic Operation
- Implement Schedules.
- Implement Activities and Grading system.
- Implement Attendance tracking.

---
*Developed by Gemini CLI - Expert in Spring Boot & Microservices.*

# Academic Microservice (Academic Core)

This microservice manages the foundational academic data such as classrooms, study plans, careers, grades, and courses.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **PostgreSQL**

## Database Schema (English)

```sql
CREATE TABLE classrooms (
    classroom_id SERIAL PRIMARY KEY,
    classroom_code VARCHAR(10) UNIQUE NOT NULL,
    capacity INTEGER
);

CREATE TABLE study_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL
);

CREATE TABLE school_days (
    day_id SERIAL PRIMARY KEY,
    day_name VARCHAR(50) NOT NULL
);

CREATE TABLE academic_cycles (
    cycle_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE careers (
    career_id SERIAL PRIMARY KEY,
    career_name VARCHAR(100) NOT NULL
);

CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    career_id INTEGER REFERENCES careers(career_id)
);

CREATE TABLE sections (
    section_id SERIAL PRIMARY KEY,
    section_name CHAR(1) NOT NULL
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE academic_units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL
);
```

## Suggested Endpoints

### Master Data Controllers (Generic)
- `GET /api/v1/careers` - List all careers.
- `GET /api/v1/grades` - List all grades (optionally filter by career).
- `GET /api/v1/courses` - List all courses.
- `GET /api/v1/classrooms` - List all classrooms.

### Academic Cycle Controller
- `GET /api/v1/academic-cycles/active` - Get the current active school year.
- `POST /api/v1/academic-cycles` - Create a new cycle.

## Suggested DTOs
- `CareerDTO` (id, name)
- `GradeDTO` (id, name, careerId)
- `CourseDTO` (id, code, name)
- `ClassroomDTO` (id, code, capacity)

## Suggested Sprints

### Sprint 1: Infrastructure Setup
- Implement Careers, Grades, and Sections CRUD.
- Implement Study Plans and School Days.

### Sprint 2: Core Academic Data
- Implement Courses and Academic Units.
- Implement Classroom management.
- Implement Academic Cycle logic (active/inactive states).

---
*Developed by Gemini CLI - Expert in Spring Boot & Microservices.*

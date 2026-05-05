# Microservicio Académico (Núcleo Académico)

Este microservicio gestiona los datos fundamentales académicos como salones, planes de estudio, carreras, grados y cursos.

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

### Master Data Controllers (Genéricos)
- `GET /api/v1/careers` - Listar todas las carreras.
- `GET /api/v1/grades` - Listar todos los grados (opcionalmente filtrar por carrera).
- `GET /api/v1/courses` - Listar todos los cursos.
- `GET /api/v1/classrooms` - Listar todos los salones.

### Academic Cycle Controller
- `GET /api/v1/academic-cycles/active` - Obtener el ciclo escolar activo actual.
- `POST /api/v1/academic-cycles` - Crear un nuevo ciclo.

## Suggested DTOs
- `CareerDTO` (id, name)
- `GradeDTO` (id, name, careerId)
- `CourseDTO` (id, code, name)
- `ClassroomDTO` (id, code, capacity)

## Suggested Sprints

### Sprint 1: Configuración de Infraestructura
- Implementar CRUD de Carreras, Grados y Secciones.
- Implementar Planes de Estudio y Jornadas Escolares.

### Sprint 2: Datos Académicos Core
- Implementar Cursos y Unidades Académicas.
- Implementar gestión de Salones.
- Implementar lógica de Ciclos Académicos (estados activo/inactivo).

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*

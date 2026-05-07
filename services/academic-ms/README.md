# Microservicio Académico (Núcleo Académico)

Este microservicio gestiona los datos fundamentales académicos como salones, planes de estudio, carreras, grados, cursos y docentes.

## Responsabilidad del servicio

`academic-ms` es el dueño de los catálogos y recursos académicos. Por separación de microservicios, este servicio debe administrar directamente los docentes.

`student-and-enrollment-ms` no debe crear, editar ni eliminar docentes. Ese servicio solo guarda el `teacherId` en `teacher_assignments` para relacionar un docente existente con curso, grado y sección.

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

CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100)
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
- `GET /api/v1/teachers` - Listar todos los docentes.
- `GET /api/v1/teachers/{id}` - Obtener un docente por id.
- `GET /api/v1/teachers/user/{userId}` - Obtener el docente vinculado a un usuario.
- `POST /api/v1/teachers` - Crear un docente.
- `PUT /api/v1/teachers/{id}` - Actualizar un docente.
- `DELETE /api/v1/teachers/{id}` - Eliminar o desactivar un docente.

### Academic Cycle Controller
- `GET /api/v1/academic-cycles/active` - Obtener el ciclo escolar activo actual.
- `POST /api/v1/academic-cycles` - Crear un nuevo ciclo.

## Suggested DTOs
- `CareerDTO` (id, name)
- `GradeDTO` (id, name, careerId)
- `CourseDTO` (id, code, name)
- `ClassroomDTO` (id, code, capacity)
- `TeacherDTO` (id, userId, firstName, lastName, specialty, phone, email)

## Suggested Sprints

### Sprint 1: Configuración de Infraestructura
- Implementar CRUD de Carreras, Grados y Secciones.
- Implementar Planes de Estudio y Jornadas Escolares.

### Sprint 2: Datos Académicos Core
- Implementar Cursos y Unidades Académicas.
- Implementar gestión de Salones.
- Implementar lógica de Ciclos Académicos (estados activo/inactivo).
- Implementar gestión de Docentes.

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*

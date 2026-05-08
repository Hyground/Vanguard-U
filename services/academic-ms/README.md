# academic-ms

Microservicio responsable de los catalogos academicos y del registro de docentes.

La fuente de verdad del esquema es `sql.txt` y la division funcional se define en `MICROSERVICIOS_DIVISION.md`.

## Responsabilidad

Este servicio administra:

- `classrooms`
- `study_plans`
- `shifts`
- `school_cycle`
- `majors`
- `grades`
- `sections`
- `teachers`
- `courses`
- `bimonthly_units`

Tambien valida que `teachers.id_user` exista en `users`.

No debe crear cuentas de acceso, contrasenas ni roles. Eso pertenece a `users-ms`.

## Esquema oficial

```sql
CREATE TABLE classrooms (
    id_classroom SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    capacity INTEGER
);

CREATE TABLE study_plans (
    id_plan SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL
);

CREATE TABLE shifts (
    id_shift SERIAL PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL
);

CREATE TABLE school_cycle (
    id_cycle SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE majors (
    id_major SERIAL PRIMARY KEY,
    major_name VARCHAR(100) NOT NULL
);

CREATE TABLE grades (
    id_grade SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    id_major INTEGER REFERENCES majors(id_major)
);

CREATE TABLE sections (
    id_section SERIAL PRIMARY KEY,
    section_name CHAR(1) NOT NULL
);

CREATE TABLE courses (
    id_course SERIAL PRIMARY KEY,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE teachers (
    id_teacher SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    id_user INTEGER NOT NULL REFERENCES users(id_user)
);

CREATE TABLE bimonthly_units (
    id_unit SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL
);
```

## Endpoints

Todos estos endpoints deben consumirse por gateway:

```text
http://localhost:8080
```

### Catalogos

- `GET /api/v1/classrooms`
- `GET /api/v1/study-plans`
- `GET /api/v1/shifts`
- `GET /api/v1/school-cycles`
- `GET /api/v1/majors`
- `GET /api/v1/grades`
- `GET /api/v1/sections`
- `GET /api/v1/courses`
- `GET /api/v1/bimonthly-units`

### Docentes

- `GET /api/v1/teachers`
- `GET /api/v1/teachers/{id}`
- `GET /api/v1/teachers/user/{userId}`
- `GET /api/v1/teachers/search?name=...`
- `POST /api/v1/teachers`
- `PUT /api/v1/teachers/{id}`
- `DELETE /api/v1/teachers/{id}`

Request para crear docente/director/admin academico:

```json
{
  "cui": "0000000000002",
  "firstName": "Admin",
  "lastName": "Director",
  "email": "admin1@vanguard.edu",
  "userId": 2
}
```

## Contrato de datos

- `Grade` se relaciona con `Major` por `id_major`.
- `Teacher` guarda `id_user` como referencia externa.
- `academic-ms` no crea `users`, solo valida que existan cuando registra docentes.

## Arranque

- Puerto interno: `8082`
- Entrada externa: `http://localhost:8080`
- Base de datos: `bdedu`
- `ddl-auto: none`
- Health check disponible en `/actuator/health`

# Student and Enrollment MS

Microservicio responsable de la gestion de estudiantes, tutores, inscripciones, asignaciones docentes, horarios, actividades, notas y asistencia.

Este README toma como fuente principal el archivo `sql.txt` del proyecto. Aunque el sistema usa una sola base de datos compartida, este microservicio solo debe implementar la logica de negocio que corresponde a las tablas indicadas en esta documentacion.

## Stack

- Java 21
- Spring Boot 3.x
- PostgreSQL
- Spring Data JPA
- Spring Validation
- Spring Web
- OpenFeign para consultar datos administrados por otros microservicios, si el proyecto decide comunicar servicios por HTTP

## Alcance Del Microservicio

Este microservicio administra directamente estas tablas:

```text
tutor
students
enrollments
teacher_assignments
schedules
activities
grades_records
attendance
```

No debe administrar directamente usuarios, roles, docentes, catalogos academicos ni pagos. Esas tablas existen en la misma base de datos, pero pertenecen a otros microservicios.

## Mapa De Responsabilidad

```text
users-ms
  roles
  users
  password_recovery
  system_log

academic-ms
  teachers
  classrooms
  study_plans
  shifts
  school_cycle
  majors
  grades
  sections
  courses
  bimonthly_units

student-and-enrollment-ms
  tutor
  students
  enrollments
  teacher_assignments
  schedules
  activities
  grades_records
  attendance

billing-ms
  payment_methods
  payments
```

## Tablas Propias Segun `sql.txt`

```sql
CREATE TABLE tutor (
    id_tutor SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_user INTEGER REFERENCES users(id_user)
);

CREATE TABLE students (
    id_student SERIAL PRIMARY KEY,
    personal_code VARCHAR(20) UNIQUE NOT NULL,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_tutor INTEGER REFERENCES tutor(id_tutor),
    id_user INTEGER REFERENCES users(id_user)
);

CREATE TABLE enrollments (
    id_enrollment SERIAL PRIMARY KEY,
    id_student INTEGER REFERENCES students(id_student),
    id_grade INTEGER REFERENCES grades(id_grade),
    id_section INTEGER REFERENCES sections(id_section),
    id_plan INTEGER REFERENCES study_plans(id_plan),
    id_shift INTEGER REFERENCES shifts(id_shift),
    id_cycle INTEGER REFERENCES school_cycle(id_cycle),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_assignments (
    id_teacher_assignment SERIAL PRIMARY KEY,
    id_teacher INTEGER REFERENCES teachers(id_teacher),
    id_course INTEGER REFERENCES courses(id_course),
    id_grade INTEGER REFERENCES grades(id_grade),
    id_section INTEGER REFERENCES sections(id_section)
);

CREATE TABLE schedules (
    id_schedule SERIAL PRIMARY KEY,
    id_teacher_assignment INTEGER REFERENCES teacher_assignments(id_teacher_assignment),
    id_classroom INTEGER REFERENCES classrooms(id_classroom),
    day_of_week VARCHAR(15),
    start_time TIME,
    end_time TIME
);

CREATE TABLE activities (
    id_activity SERIAL PRIMARY KEY,
    id_teacher_assignment INTEGER REFERENCES teacher_assignments(id_teacher_assignment),
    id_unit INTEGER REFERENCES bimonthly_units(id_unit),
    activity_name VARCHAR(100),
    weight DECIMAL(5,2)
);

CREATE TABLE grades_records (
    id_grade_record SERIAL PRIMARY KEY,
    id_student INTEGER REFERENCES students(id_student),
    id_activity INTEGER REFERENCES activities(id_activity),
    score_obtained DECIMAL(5,2)
);

CREATE TABLE attendance (
    id_attendance SERIAL PRIMARY KEY,
    id_student INTEGER REFERENCES students(id_student),
    id_teacher_assignment INTEGER REFERENCES teacher_assignments(id_teacher_assignment),
    attendance_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20)
);
```

## Tablas Externas Referenciadas

Estas tablas se consultan o se referencian por ID, pero no son responsabilidad directa de este microservicio:

```text
users
teachers
grades
sections
study_plans
shifts
school_cycle
courses
classrooms
bimonthly_units
```

Referencias principales:

```text
tutor.id_user -> users.id_user
students.id_user -> users.id_user
students.id_tutor -> tutor.id_tutor
enrollments.id_student -> students.id_student
enrollments.id_grade -> grades.id_grade
enrollments.id_section -> sections.id_section
enrollments.id_plan -> study_plans.id_plan
enrollments.id_shift -> shifts.id_shift
enrollments.id_cycle -> school_cycle.id_cycle
teacher_assignments.id_teacher -> teachers.id_teacher
teacher_assignments.id_course -> courses.id_course
teacher_assignments.id_grade -> grades.id_grade
teacher_assignments.id_section -> sections.id_section
schedules.id_teacher_assignment -> teacher_assignments.id_teacher_assignment
schedules.id_classroom -> classrooms.id_classroom
activities.id_teacher_assignment -> teacher_assignments.id_teacher_assignment
activities.id_unit -> bimonthly_units.id_unit
grades_records.id_student -> students.id_student
grades_records.id_activity -> activities.id_activity
attendance.id_student -> students.id_student
attendance.id_teacher_assignment -> teacher_assignments.id_teacher_assignment
```

## Mapa Funcional

```text
Gestion de actores
  tutor: tutores o encargados
  students: estudiantes

Inscripciones
  enrollments: relaciona estudiante con grado, seccion, plan, jornada y ciclo escolar

Asignacion docente
  teacher_assignments: relaciona docente con curso, grado y seccion

Horarios
  schedules: define dia, hora y salon para una asignacion docente

Evaluacion
  activities: actividades evaluativas por asignacion docente y unidad
  grades_records: nota obtenida por estudiante en una actividad

Asistencia
  attendance: registro de asistencia por estudiante y asignacion docente
```

## Endpoints Disponibles

Todos estos endpoints deben consumirse por gateway:

```text
http://localhost:8080
```

Los listados generales usan paginacion de Spring:

```text
GET /api/v1/students?page=0&size=20
GET /api/v1/enrollments?page=1&size=25
```

La respuesta paginada incluye `content`, `totalElements`, `totalPages`, `size`, `number`, `first`, `last` y metadatos similares.

### Tutors

```text
GET    /api/v1/tutors?page=0&size=20
GET    /api/v1/tutors/{id}
GET    /api/v1/tutors/cui/{cui}
GET    /api/v1/tutors/user/{userId}
POST   /api/v1/tutors
PUT    /api/v1/tutors/{id}
DELETE /api/v1/tutors/{id}
```

Request:

```json
{
  "cui": "1234567890123",
  "firstName": "Carlos",
  "lastName": "Perez",
  "userId": 2
}
```

### Students

```text
GET    /api/v1/students?page=0&size=20
GET    /api/v1/students/{id}
GET    /api/v1/students/cui/{cui}
GET    /api/v1/students/personal-code/{personalCode}
GET    /api/v1/students/user/{userId}
GET    /api/v1/students/tutor/{tutorId}
POST   /api/v1/students
PUT    /api/v1/students/{id}
DELETE /api/v1/students/{id}
```

Request:

```json
{
  "personalCode": "STU-001",
  "cui": "1234567890123",
  "firstName": "Maria",
  "lastName": "Garcia",
  "tutorId": 1,
  "userId": 3
}
```

### Enrollments

```text
GET    /api/v1/enrollments?page=0&size=20
GET    /api/v1/enrollments/{id}
GET    /api/v1/enrollments/student/{studentId}
GET    /api/v1/enrollments/cycle/{cycleId}
GET    /api/v1/enrollments/grade/{gradeId}/section/{sectionId}/cycle/{cycleId}
POST   /api/v1/enrollments
PUT    /api/v1/enrollments/{id}
DELETE /api/v1/enrollments/{id}
```

Request:

```json
{
  "studentId": 1,
  "gradeId": 1,
  "sectionId": 1,
  "planId": 1,
  "shiftId": 1,
  "cycleId": 1,
  "enrollmentDate": "2026-05-05T10:00:00"
}
```

### Teacher Assignments

Este recurso no administra docentes. `teacherId` es un identificador externo cuyo registro maestro pertenece a `academic-ms`.

```text
GET    /api/v1/teacher-assignments?page=0&size=20
GET    /api/v1/teacher-assignments/{id}
GET    /api/v1/teacher-assignments/teacher/{teacherId}
GET    /api/v1/teacher-assignments/grade/{gradeId}/section/{sectionId}
POST   /api/v1/teacher-assignments
PUT    /api/v1/teacher-assignments/{id}
DELETE /api/v1/teacher-assignments/{id}
```

Request:

```json
{
  "teacherId": 1,
  "courseId": 1,
  "gradeId": 1,
  "sectionId": 1
}
```

### Schedules

Los endpoints por docente filtran horarios usando el `teacherId` guardado en `teacher_assignments`; no consultan ni modifican datos maestros del docente.

```text
GET    /api/v1/schedules?page=0&size=20
GET    /api/v1/schedules/{id}
GET    /api/v1/schedules/teacher-assignment/{teacherAssignmentId}
GET    /api/v1/schedules/classroom/{classroomId}/day/{dayOfWeek}
GET    /api/v1/schedules/teacher/{teacherId}/day/{dayOfWeek}
POST   /api/v1/schedules
PUT    /api/v1/schedules/{id}
DELETE /api/v1/schedules/{id}
```

Request:

```json
{
  "teacherAssignmentId": 1,
  "classroomId": 1,
  "dayOfWeek": "MONDAY",
  "startTime": "08:00:00",
  "endTime": "09:00:00"
}
```

### Activities

```text
GET    /api/v1/activities?page=0&size=20
GET    /api/v1/activities/{id}
GET    /api/v1/activities/teacher-assignment/{teacherAssignmentId}
POST   /api/v1/activities
PUT    /api/v1/activities/{id}
DELETE /api/v1/activities/{id}
```

Request:

```json
{
  "teacherAssignmentId": 1,
  "unitId": 1,
  "activityName": "Exam 1",
  "weight": 25.00
}
```

### Grades Records

```text
GET    /api/v1/grades-records?page=0&size=20
GET    /api/v1/grades-records/{id}
GET    /api/v1/grades-records/student/{studentId}
GET    /api/v1/grades-records/activity/{activityId}
POST   /api/v1/grades-records
PUT    /api/v1/grades-records/{id}
DELETE /api/v1/grades-records/{id}
```

Request:

```json
{
  "studentId": 1,
  "activityId": 1,
  "scoreObtained": 88.50
}
```

### Attendance

```text
GET    /api/v1/attendance?page=0&size=20
GET    /api/v1/attendance/{id}
GET    /api/v1/attendance/student/{studentId}
GET    /api/v1/attendance/teacher-assignment/{teacherAssignmentId}
GET    /api/v1/attendance/date/{attendanceDate}
GET    /api/v1/attendance/student/{studentId}/date/{attendanceDate}
POST   /api/v1/attendance
PUT    /api/v1/attendance/{id}
DELETE /api/v1/attendance/{id}
```

`attendanceDate` usa formato ISO:

```text
2026-05-05
```

Request:

```json
{
  "studentId": 1,
  "teacherAssignmentId": 1,
  "attendanceDate": "2026-05-05",
  "status": "PRESENT"
}
```

## DTOs Disponibles

```text
TutorRequest
TutorResponse
StudentRequest
StudentResponse
EnrollmentRequest
EnrollmentResponse
TeacherAssignmentRequest
TeacherAssignmentResponse
ScheduleRequest
ScheduleResponse
ActivityRequest
ActivityResponse
GradeRecordRequest
GradeRecordResponse
AttendanceRequest
AttendanceResponse
```

## Reglas De Negocio

### Implementadas Actualmente

- No registrar estudiante o tutor con CUI duplicado.
- No registrar estudiante con `personal_code` duplicado.
- No crear estudiante con `tutorId` inexistente cuando se envia `tutorId`.
- No crear inscripcion si el estudiante no existe.
- No duplicar inscripciones para el mismo estudiante, ciclo, grado, seccion, plan y jornada.
- No duplicar una asignacion docente con la misma combinacion de docente, curso, grado y seccion.
- No crear horario si la asignacion docente no existe.
- Validar que `dayOfWeek` pertenezca a `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY` o `SUNDAY`.
- Validar que `startTime` sea menor que `endTime` cuando ambos valores se envian.
- Evitar choques de horario por docente.
- Evitar choques de horario por salon.
- No crear actividad si la asignacion docente no existe.
- Validar que `weight` no sea negativo.
- Validar que `weight` no sea mayor que 100.00.
- No registrar nota si el estudiante o la actividad no existen.
- Validar que `scoreObtained` no sea negativo.
- Validar que `scoreObtained` no sea mayor que 100.00.
- No duplicar nota para el mismo estudiante y la misma actividad.
- No registrar asistencia si el estudiante o la asignacion docente no existen.
- No duplicar asistencia para el mismo estudiante, asignacion docente y fecha.
- Restringir `attendance.status` a `PRESENT`, `ABSENT`, `LATE` o `EXCUSED`.
- Si `attendanceDate` no se envia, se usa la fecha actual.
- Evitar borrados internos que rompan historial academico relacionado.

### Pendientes Recomendados

- Definir si las validaciones de IDs externos se mantienen por consulta directa a la base compartida o se migran a llamadas HTTP entre microservicios.
- Definir si los borrados deben reemplazarse por estado activo/inactivo. El SQL actual no incluye columnas de estado para estas tablas.

## Estado Actual De Desarrollo

- Proyecto Spring Boot configurado.
- Entidades JPA creadas para las tablas propias del microservicio.
- Repositorios creados.
- DTOs y mapper creados.
- Servicios de aplicacion creados con validaciones iniciales.
- Controladores REST creados.
- Manejo global de errores creado.
- Listados generales con paginacion.
- Pruebas unitarias iniciales para reglas de inscripciones, horarios y asistencia.
- CRUD directo de docentes eliminado de este microservicio; solo se conserva `teacherId` como referencia externa.

## Siguientes Pasos Recomendados

1. Ampliar pruebas unitarias de servicios para estudiantes, tutores, asignaciones docentes, actividades y notas.
2. Agregar pruebas de endpoints principales.
3. Documentar o implementar validacion de IDs externos contra `academic-ms` y `users-ms`.
4. Definir indices de base de datos en conjunto con los otros microservicios, especialmente para consultas por `studentId`, `teacherId`, `cycleId`, `gradeId`, `sectionId` y fechas.
5. Evaluar cache o replica de lectura solo cuando los endpoints principales y las consultas reales esten cerrados.
6. Crear Dockerfile del microservicio cuando se defina la estrategia de despliegue.

## Notas De Consistencia

- El codigo debe estar en ingles: clases, metodos, variables, endpoints y comentarios tecnicos.
- La documentacion para usuarios puede estar en espanol.
- El SQL oficial usa `tutor`, no `guardians`.
- El SQL oficial usa `grades_records`, no `student_grades`.
- El SQL oficial usa `id_*` como nombres de llaves primarias y foraneas.
- Puerto interno: `8083`.
- Entrada externa: `http://localhost:8080`.

## Tareas De Infraestructura Cloud

Este microservicio debe usar la infraestructura con cuidado porque maneja inscripciones, horarios, notas y asistencia.

Le corresponde:

1. Hecho: mantener escrituras contra PostgreSQL master usando `DB_WRITE_HOST` y `DB_WRITE_PORT`.
2. Hecho: conservar compatibilidad con `DB_HOST` y `DB_PORT` si las variables nuevas no existen.
3. Hecho: configurar pool basico de conexiones con HikariCP.
4. Pendiente: usar PostgreSQL replica con `DB_READ_HOST` y `DB_READ_PORT` para listados, horarios, reportes de notas y reportes de asistencia.
5. Pendiente: mantener en master las lecturas que deben ver inmediatamente una escritura recien hecha, por ejemplo validar una inscripcion antes de continuar el flujo.
6. Pendiente: usar Redis de forma limitada para cache temporal de validaciones frecuentes y consultas repetidas de horarios.
7. Pendiente: no guardar notas, asistencia, inscripciones ni pagos en Redis como fuente de verdad.
8. Pendiente: agregar indices y paginacion para consultas por estudiante, docente, ciclo, grado, seccion y fechas.
9. Pendiente: medir los endpoints principales antes de mover mas lecturas a replica o cache.

La replica puede tener atraso respecto al master. Por eso no debe usarse en flujos donde el usuario necesita ver inmediatamente un dato recien creado.

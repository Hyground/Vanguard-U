# Student and Enrollment MS

Microservicio responsable de la gestion de estudiantes, tutores, docentes, inscripciones, asignaciones docentes, horarios, actividades, notas y asistencia.

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
teachers
tutor
students
enrollments
teacher_assignments
schedules
activities
grades_records
attendance
```

No debe administrar directamente usuarios, roles, catalogos academicos ni pagos. Esas tablas existen en la misma base de datos, pero pertenecen a otros microservicios.

## Mapa De Responsabilidad

```text
users-ms
  roles
  users
  password_recovery
  system_log

academic-ms
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
  teachers
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
CREATE TABLE teachers (
    id_teacher SERIAL PRIMARY KEY,
    cui CHAR(13) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    id_user INTEGER REFERENCES users(id_user)
);

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
teachers.id_user -> users.id_user
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
  teachers: docentes
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

## Endpoints Sugeridos

### Teachers

- `POST /api/v1/teachers`
- `GET /api/v1/teachers`
- `GET /api/v1/teachers/{id}`
- `PUT /api/v1/teachers/{id}`
- `DELETE /api/v1/teachers/{id}`

### Tutors

- `POST /api/v1/tutors`
- `GET /api/v1/tutors`
- `GET /api/v1/tutors/{id}`
- `PUT /api/v1/tutors/{id}`
- `DELETE /api/v1/tutors/{id}`

### Students

- `POST /api/v1/students`
- `GET /api/v1/students`
- `GET /api/v1/students/{id}`
- `GET /api/v1/students/tutor/{tutorId}`
- `PUT /api/v1/students/{id}`
- `DELETE /api/v1/students/{id}`

### Enrollments

- `POST /api/v1/enrollments`
- `GET /api/v1/enrollments`
- `GET /api/v1/enrollments/{id}`
- `GET /api/v1/enrollments/student/{studentId}`
- `GET /api/v1/enrollments/cycle/{cycleId}`

### Teacher Assignments

- `POST /api/v1/teacher-assignments`
- `GET /api/v1/teacher-assignments`
- `GET /api/v1/teacher-assignments/{id}`
- `GET /api/v1/teacher-assignments/teacher/{teacherId}`
- `GET /api/v1/teacher-assignments/grade/{gradeId}/section/{sectionId}`

### Schedules

- `POST /api/v1/schedules`
- `GET /api/v1/schedules`
- `GET /api/v1/schedules/{id}`
- `GET /api/v1/schedules/teacher-assignment/{teacherAssignmentId}`

### Activities

- `POST /api/v1/activities`
- `GET /api/v1/activities`
- `GET /api/v1/activities/{id}`
- `GET /api/v1/activities/teacher-assignment/{teacherAssignmentId}`

### Grades Records

- `POST /api/v1/grades-records`
- `GET /api/v1/grades-records/student/{studentId}`
- `GET /api/v1/grades-records/activity/{activityId}`

### Attendance

- `POST /api/v1/attendance`
- `GET /api/v1/attendance/student/{studentId}`
- `GET /api/v1/attendance/teacher-assignment/{teacherAssignmentId}`
- `GET /api/v1/attendance/date/{date}`

## DTOs Sugeridos

```text
TeacherRequest
TeacherResponse
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

## Reglas De Negocio Iniciales

- No registrar estudiantes sin tutor valido cuando `id_tutor` sea requerido por el flujo.
- No registrar estudiante, tutor o docente con CUI duplicado.
- No registrar estudiante con `personal_code` duplicado.
- No crear inscripcion si el estudiante no existe.
- No crear asignacion docente si el docente no existe.
- No crear horario si la asignacion docente no existe.
- No registrar nota si el estudiante o la actividad no existen.
- No registrar asistencia si el estudiante o la asignacion docente no existen.
- Validar que `start_time` sea menor que `end_time`.
- Validar que `score_obtained` y `weight` no sean negativos.

## Orden Recomendado De Desarrollo

1. Configurar proyecto Spring Boot del microservicio.
2. Crear entidades JPA para las 9 tablas propias.
3. Crear repositorios.
4. Crear DTOs y mappers.
5. Crear servicios de dominio con validaciones.
6. Crear controladores REST.
7. Agregar manejo global de errores.
8. Agregar pruebas unitarias de servicios.
9. Agregar pruebas de endpoints principales.

## Notas De Consistencia

- El codigo debe estar en ingles: clases, metodos, variables, endpoints y comentarios tecnicos.
- La documentacion para usuarios puede estar en espanol.
- El SQL oficial usa `tutor`, no `guardians`.
- El SQL oficial usa `grades_records`, no `student_grades`.
- El SQL oficial usa `id_*` como nombres de llaves primarias y foraneas.

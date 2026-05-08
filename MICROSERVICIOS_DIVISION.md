# Division Real De Microservicios

La fuente de verdad para tablas y relaciones es `sql.txt`.

La base de datos es compartida (`bdedu`), pero cada microservicio tiene dueno claro sobre un conjunto de tablas. Un servicio puede guardar IDs externos, pero no debe crear ni administrar tablas ajenas.

## Regla Base

- `users-ms` maneja cuentas de acceso.
- `academic-ms` maneja catalogos academicos y docentes.
- `student-and-enrollment-ms` maneja personas academicas, inscripciones, asignaciones, horarios, notas y asistencia.
- `billing-ms` maneja pagos.
- `gateway-ms` solo enruta y protege; no administra tablas.

## `users-ms`

Tablas propias:

- `roles`
- `users`
- `password_recovery`
- `system_log`

Este servicio crea y mantiene:

- usuario de acceso
- contrasena
- rol
- recuperacion de contrasena
- auditoria y logs

No debe crear:

- `students`
- `tutor`
- `teachers`
- `payments`
- `courses`
- `grades`

## `academic-ms`

Tablas propias:

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

Este servicio crea y mantiene:

- salones
- planes de estudio
- jornadas
- ciclo escolar
- carreras
- grados
- secciones
- docentes
- cursos
- unidades bimestrales

Referencia externa:

- `teachers.id_user -> users.id_user`

## `student-and-enrollment-ms`

Tablas propias:

- `tutor`
- `students`
- `enrollments`
- `teacher_assignments`
- `schedules`
- `activities`
- `grades_records`
- `attendance`

Este servicio crea y mantiene:

- perfil de tutor
- perfil de estudiante
- matriculas
- asignaciones docentes
- horarios
- actividades
- notas por actividad
- asistencia

Referencias externas:

- `tutor.id_user -> users.id_user`
- `students.id_user -> users.id_user`
- `students.id_tutor -> tutor.id_tutor`
- `enrollments.id_grade -> grades.id_grade`
- `enrollments.id_section -> sections.id_section`
- `enrollments.id_plan -> study_plans.id_plan`
- `enrollments.id_shift -> shifts.id_shift`
- `enrollments.id_cycle -> school_cycle.id_cycle`
- `teacher_assignments.id_teacher -> teachers.id_teacher`
- `teacher_assignments.id_course -> courses.id_course`
- `teacher_assignments.id_grade -> grades.id_grade`
- `teacher_assignments.id_section -> sections.id_section`
- `schedules.id_teacher_assignment -> teacher_assignments.id_teacher_assignment`
- `schedules.id_classroom -> classrooms.id_classroom`
- `activities.id_teacher_assignment -> teacher_assignments.id_teacher_assignment`
- `activities.id_unit -> bimonthly_units.id_unit`
- `grades_records.id_student -> students.id_student`
- `grades_records.id_activity -> activities.id_activity`
- `attendance.id_student -> students.id_student`
- `attendance.id_teacher_assignment -> teacher_assignments.id_teacher_assignment`

Validacion esperada:

- antes de guardar, este servicio debe confirmar que los IDs externos existen en la BD compartida
- si un ID no existe, debe fallar con error de recurso no encontrado o regla de negocio equivalente

## `billing-ms`

Tablas propias:

- `payment_methods`
- `payments`

Referencias externas:

- `payments.id_student -> students.id_student`
- `payments.id_user_issuer -> users.id_user`
- `payments.id_user_payer -> users.id_user`

## `gateway-ms`

No administra tablas.

Responsabilidades:

- routing
- seguridad perimetral
- rate limiting
- timeouts
- circuit breaker
- logging

## Flujo Real De Identidad

- `users-ms` crea la cuenta de acceso.
- `student-and-enrollment-ms` crea el perfil academico de la persona.

Ejemplo estudiante:

1. `users-ms` crea `users.id_user`.
2. `student-and-enrollment-ms` crea `students` con ese `id_user`.
3. El estudiante queda listo para inscripcion.

Ejemplo tutor:

1. `users-ms` crea `users.id_user`.
2. `student-and-enrollment-ms` crea `tutor` con ese `id_user`.
3. Luego `students.id_tutor` puede apuntar a ese tutor.

## Que Datos Crea Cada Servicio

### `users-ms`

- `username` o correo de acceso
- `password`
- `role`
- tokens o procesos de recuperacion

### `student-and-enrollment-ms`

- `cui`
- `personal_code`
- `first_name`
- `last_name`
- referencias a `id_user`
- referencias a `id_tutor`

### `academic-ms`

- catalogos academicos
- docentes
- cursos
- grados
- secciones
- jornadas
- ciclos
- unidades bimestrales

## Lo Que No Debe Hacer `student-and-enrollment-ms`

- crear `users`
- guardar contrasenas
- manejar roles
- administrar catalogos academicos
- administrar docentes maestros

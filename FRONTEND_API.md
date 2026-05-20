# Frontend API

Guia corta para consumir el backend de Vanguard-U desde frontend, Postman o pruebas HTTP.

## Base URL

Usar siempre el gateway publico:

```text
http://api.wissegt.com
```

No consumir directamente los microservicios internos:

```text
users-ms:8081
academic-ms:8082
student-and-enrollment-ms:8083
billing-ms:8084
```

## Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "username": "load_admin",
  "password": "Demo123!"
}
```

Respuesta:

```json
{
  "idUser": 1,
  "token": "...",
  "username": "load_admin",
  "role": "ADMIN"
}
```

Guardar `token` y enviarlo en las siguientes peticiones:

```http
Authorization: Bearer <token>
```

## Usuarios Y Roles

```http
GET /api/v1/users
GET /api/v1/users/{id}
GET /api/v1/roles
PATCH /api/v1/users/{id}/status
```

Actualizar estado:

```json
{
  "status": true
}
```

Registrar usuario:

```http
POST /api/v1/auth/register
```

```json
{
  "username": "student_demo_1",
  "password": "Demo123!",
  "roleId": 3
}
```

Roles:

```text
1 ADMIN
2 TEACHER
3 STUDENT
4 TUTOR
```

## Academico

### Catalogos

```http
GET /api/v1/majors
GET /api/v1/grades
GET /api/v1/courses
GET /api/v1/classrooms
GET /api/v1/sections
GET /api/v1/shifts
GET /api/v1/study-plans
GET /api/v1/school-cycles
GET /api/v1/bimonthly-units
GET /api/v1/teachers
```

### Crear carrera

```http
POST /api/v1/majors
```

```json
{
  "name": "Bachillerato en Computacion"
}
```

### Crear curso

```http
POST /api/v1/courses
```

```json
{
  "code": "MAT1",
  "name": "Matematica I"
}
```

### Crear grado

```http
POST /api/v1/grades
```

```json
{
  "name": "Primero Basico",
  "majorId": 1
}
```

### Crear aula

```http
POST /api/v1/classrooms
```

```json
{
  "code": "A101",
  "capacity": 35
}
```

### Crear ciclo escolar

```http
POST /api/v1/school-cycles
```

```json
{
  "year": 2026,
  "active": true
}
```

Activar ciclo:

```http
PUT /api/v1/school-cycles/{id}/activate
```

### Crear docente

Primero debe existir un usuario con rol `TEACHER` o `ADMIN`.

```http
POST /api/v1/teachers
```

```json
{
  "cui": "1234567890123",
  "firstName": "Ana",
  "lastName": "Lopez",
  "email": "ana.lopez@vanguard.edu",
  "userId": 2
}
```

## Estudiantes E Inscripciones

Los listados aceptan paginacion:

```text
?page=0&size=20&sort=id,desc
```

### Tutores

```http
GET /api/v1/tutors
POST /api/v1/tutors
```

```json
{
  "cui": "1234567890123",
  "firstName": "Carlos",
  "lastName": "Perez",
  "userId": 10
}
```

### Estudiantes

```http
GET /api/v1/students
POST /api/v1/students
```

```json
{
  "personalCode": "EST-2026-001",
  "cui": "1234567890124",
  "firstName": "Luis",
  "lastName": "Perez",
  "tutorId": 1,
  "userId": 11
}
```

Consultas utiles:

```http
GET /api/v1/students/{id}
GET /api/v1/students/cui/{cui}
GET /api/v1/students/personal-code/{personalCode}
GET /api/v1/students/user/{userId}
GET /api/v1/students/tutor/{tutorId}
```

### Inscripciones

```http
GET /api/v1/enrollments
POST /api/v1/enrollments
```

```json
{
  "studentId": 1,
  "gradeId": 1,
  "sectionId": 1,
  "planId": 1,
  "shiftId": 1,
  "cycleId": 1,
  "enrollmentDate": "2026-05-20T08:00:00"
}
```

### Asignaciones docente

```http
GET /api/v1/teacher-assignments
POST /api/v1/teacher-assignments
```

```json
{
  "teacherId": 1,
  "courseId": 1,
  "gradeId": 1,
  "sectionId": 1
}
```

### Horarios

```http
GET /api/v1/schedules
POST /api/v1/schedules
```

```json
{
  "teacherAssignmentId": 1,
  "classroomId": 1,
  "dayOfWeek": "MONDAY",
  "startTime": "07:30:00",
  "endTime": "08:15:00"
}
```

### Actividades

```http
GET /api/v1/activities
POST /api/v1/activities
```

```json
{
  "teacherAssignmentId": 1,
  "unitId": 1,
  "activityName": "Examen corto",
  "weight": 20.00
}
```

### Notas

```http
GET /api/v1/grades-records
POST /api/v1/grades-records
```

```json
{
  "studentId": 1,
  "activityId": 1,
  "scoreObtained": 88.50
}
```

### Asistencia

```http
GET /api/v1/attendance
POST /api/v1/attendance
```

```json
{
  "studentId": 1,
  "teacherAssignmentId": 1,
  "attendanceDate": "2026-05-20",
  "status": "PRESENT"
}
```

## Pagos

### Metodos de pago

```http
GET /api/v1/billing/payment-methods
POST /api/v1/billing/payment-methods
```

```json
{
  "methodName": "Transferencia"
}
```

### Registrar pago

```http
POST /api/v1/billing/payments
```

```json
{
  "idStudent": 1,
  "idMethod": 1,
  "idUserIssuer": 1,
  "idUserPayer": 10,
  "amount": 250.00
}
```

Consultar pagos por estudiante:

```http
GET /api/v1/billing/payments/student/{idStudent}
```

## Flujo Para Crear Estudiante

1. Crear usuario con rol `STUDENT`.
2. Crear tutor, si aplica.
3. Crear estudiante usando el `idUser` del usuario.
4. Crear inscripcion.

## Ejemplo Fetch

```js
const API_URL = "http://api.wissegt.com";

async function login() {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "load_admin",
      password: "Demo123!",
    }),
  });

  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

async function getStudents(token) {
  const response = await fetch(`${API_URL}/api/v1/students?page=0&size=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Could not load students");
  return response.json();
}
```

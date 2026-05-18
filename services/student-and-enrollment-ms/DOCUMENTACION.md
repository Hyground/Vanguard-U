# Documentación: Student and Enrollment (student-and-enrollment-ms)

Gestión de estudiantes, inscripciones, asistencias y notas.

## 🎓 Estudiantes y Tutores

### Crear Estudiante
- **Endpoint:** `POST /api/v1/students`
- **JSON Request:**
```json
{
  "firstName": "Carlos",
  "lastName": "Gomez",
  "cui": "1112223334445",
  "email": "carlos.g@estudiante.edu",
  "userId": 3
}
```

### Crear Tutor
- **Endpoint:** `POST /api/v1/tutors`
- **JSON Request:**
```json
{
  "firstName": "Maria",
  "lastName": "Gomez",
  "phone": "5555-4444",
  "email": "maria@tutor.com"
}
```

## 📝 Inscripciones y Académico

- **Inscripciones:** `POST /api/v1/enrollments`
- **Asistencias:** `POST /api/v1/attendance`
- **Notas:** `POST /api/v1/grades-records`
- **Actividades:** `POST /api/v1/activities`
- **Horarios:** `POST /api/v1/schedules`
- **Asignación Docente:** `POST /api/v1/teacher-assignments`

### Ejemplo Inscripción
- **Endpoint:** `POST /api/v1/enrollments`
- **JSON Request:**
```json
{
  "idStudent": 1,
  "idGrade": 1,
  "idSection": 1,
  "idSchoolCycle": 1,
  "enrollmentDate": "2026-01-15T10:00:00Z"
}
```

# Documentación: Academic Microservice (academic-ms)

Gestiona los catálogos académicos y la información de los docentes.

## 👨‍🏫 Docentes (Teachers)

### Listar Docentes
- **Endpoint:** `GET /api/v1/teachers`

### Crear Docente
- **Endpoint:** `POST /api/v1/teachers`
- **JSON Request:**
```json
{
  "cui": "0000000000001",
  "firstName": "Juan",
  "lastName": "Perez",
  "email": "juan.perez@vanguard.edu",
  "userId": 2
}
```

## 🏫 Catálogos Académicos

Todos los endpoints admiten `GET` (listar), `GET /{id}` (uno), `POST` (crear), `PUT` (actualizar) y `DELETE` (borrar).

- **Ciclos Escolares:** `/api/v1/school-cycles`
- **Carreras (Majors):** `/api/v1/majors`
- **Salones:** `/api/v1/classrooms`
- **Cursos:** `/api/v1/courses`
- **Grados:** `/api/v1/grades`
- **Secciones:** `/api/v1/sections`
- **Planes de Estudio:** `/api/v1/study-plans`
- **Jornadas (Shifts):** `/api/v1/shifts`
- **Unidades Bimestrales:** `/api/v1/bimonthly-units`

### Ejemplo JSON para Catálogos (Sección)
```json
{
  "sectionName": "Sección A",
  "status": true
}
```

import { apiRequest, asList } from './client';

const DEFAULT_PAGE_SIZE = 20;

export function buildPagedEndpoint(endpoint, page = 0, size = DEFAULT_PAGE_SIZE) {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}page=${page}&size=${size}&sort=id,desc`;
}

export const adminResources = [
  {
    id: 'users',
    group: 'Seguridad',
    title: 'Usuarios',
    endpoint: '/users',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'username', label: 'Usuario' },
      { key: 'role', label: 'Rol' },
      { key: 'status', label: 'Estado', type: 'boolean' },
    ],
  },
  {
    id: 'roles',
    group: 'Seguridad',
    title: 'Roles',
    endpoint: '/roles',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Rol' },
    ],
  },
  {
    id: 'majors',
    group: 'Academico',
    title: 'Carreras',
    endpoint: '/majors',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  {
    id: 'grades',
    group: 'Academico',
    title: 'Grados',
    endpoint: '/grades',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
      { key: 'majorName', label: 'Carrera' },
    ],
  },
  {
    id: 'courses',
    group: 'Academico',
    title: 'Cursos',
    endpoint: '/courses',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'code', label: 'Codigo' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  {
    id: 'classrooms',
    group: 'Academico',
    title: 'Aulas',
    endpoint: '/classrooms',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'code', label: 'Codigo' },
      { key: 'capacity', label: 'Capacidad' },
    ],
  },
  {
    id: 'sections',
    group: 'Academico',
    title: 'Secciones',
    endpoint: '/sections',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
    ],
  },
  {
    id: 'school-cycles',
    group: 'Academico',
    title: 'Ciclos escolares',
    endpoint: '/school-cycles',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'year', label: 'Anio' },
      { key: 'active', label: 'Activo', type: 'boolean' },
    ],
  },
  {
    id: 'teachers',
    group: 'Personas',
    title: 'Docentes',
    endpoint: '/teachers',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'firstName', label: 'Nombres' },
      { key: 'lastName', label: 'Apellidos' },
      { key: 'email', label: 'Correo' },
      { key: 'userId', label: 'Usuario' },
    ],
  },
  {
    id: 'students',
    group: 'Personas',
    title: 'Estudiantes',
    endpoint: '/students',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'personalCode', label: 'Codigo' },
      { key: 'firstName', label: 'Nombres' },
      { key: 'lastName', label: 'Apellidos' },
      { key: 'userId', label: 'Usuario' },
    ],
  },
  {
    id: 'tutors',
    group: 'Personas',
    title: 'Tutores',
    endpoint: '/tutors',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'cui', label: 'CUI' },
      { key: 'firstName', label: 'Nombres' },
      { key: 'lastName', label: 'Apellidos' },
      { key: 'userId', label: 'Usuario' },
    ],
  },
  {
    id: 'enrollments',
    group: 'Operaciones',
    title: 'Inscripciones',
    endpoint: '/enrollments',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'studentId', label: 'Estudiante', type: 'ref', ref: 'students' },
      { key: 'gradeId', label: 'Grado', type: 'ref', ref: 'grades' },
      { key: 'sectionId', label: 'Seccion', type: 'ref', ref: 'sections' },
      { key: 'cycleId', label: 'Ciclo', type: 'ref', ref: 'school-cycles' },
      { key: 'enrollmentDate', label: 'Fecha', type: 'date' },
    ],
  },
  {
    id: 'teacher-assignments',
    group: 'Operaciones',
    title: 'Asignaciones docentes',
    endpoint: '/teacher-assignments',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'teacherId', label: 'Docente', type: 'ref', ref: 'teachers' },
      { key: 'courseId', label: 'Curso', type: 'ref', ref: 'courses' },
      { key: 'gradeId', label: 'Grado', type: 'ref', ref: 'grades' },
      { key: 'sectionId', label: 'Seccion', type: 'ref', ref: 'sections' },
    ],
  },
  {
    id: 'schedules',
    group: 'Operaciones',
    title: 'Horarios',
    endpoint: '/schedules',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'dayOfWeek', label: 'Dia' },
      { key: 'startTime', label: 'Inicio' },
      { key: 'endTime', label: 'Fin' },
      { key: 'teacherAssignmentId', label: 'Asignacion', type: 'ref', ref: 'teacher-assignments' },
      { key: 'classroomId', label: 'Aula', type: 'ref', ref: 'classrooms' },
    ],
  },
  {
    id: 'payment-methods',
    group: 'Finanzas',
    title: 'Metodos de pago',
    endpoint: '/billing/payment-methods',
    columns: [
      { key: 'idMethod', label: 'ID' },
      { key: 'methodName', label: 'Metodo' },
    ],
  },
  {
    id: 'grades_records',
    group: 'Operaciones',
    title: 'Registro de Notas',
    endpoint: '/grades-records',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'studentId', label: 'Estudiante', type: 'ref', ref: 'students' },
      { key: 'activityId', label: 'Actividad', type: 'ref', ref: 'activities' },
      { key: 'scoreObtained', label: 'Nota' },
    ],
  },
];

export function listResource(resource, token, page = 0) {
  const url = buildPagedEndpoint(resource.endpoint, page);
  return apiRequest(url, { token });
}

export function getResourceById(resourceId, id, token) {
  const resource = adminResources.find((item) => item.id === resourceId);
  if (!resource || id === null || id === undefined) return Promise.resolve(null);
  const baseEndpoint = resource.endpoint.split('?')[0];
  return apiRequest(`${baseEndpoint}/${id}`, { token });
}

export function updateUserStatus(userId, status, token) {
  return apiRequest(`/users/${userId}/status`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createResource(resourceId, data, token) {
  const resource = adminResources.find(r => r.id === resourceId);
  return apiRequest(resource.endpoint, {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateResource(resourceId, id, data, token) {
  const resource = adminResources.find(r => r.id === resourceId);
  const baseEndpoint = resource.endpoint.split('?')[0];
  return apiRequest(`${baseEndpoint}/${id}`, {
    token,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function patchResource(resourceId, id, data, token) {
  const resource = adminResources.find(r => r.id === resourceId);
  const baseEndpoint = resource.endpoint.split('?')[0];
  return apiRequest(`${baseEndpoint}/${id}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteResource(resourceId, id, token) {
  const resource = adminResources.find(r => r.id === resourceId);
  if (!resource) return Promise.reject(new Error('Recurso no encontrado'));
  const baseEndpoint = resource.endpoint.split('?')[0];
  return apiRequest(`${baseEndpoint}/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function getAdminOverview(token) {
  try {
    const summary = await apiRequest('/admin/summary', { token });
    
    // Mapear el DTO del agregador al formato que espera el componente Dashboard
    return [
      { id: 'users', label: 'Usuarios', value: summary.totalUsers },
      { id: 'students', label: 'Estudiantes', value: summary.totalStudents },
      { id: 'teachers', label: 'Docentes', value: summary.totalTeachers },
      { id: 'enrollments', label: 'Inscripciones', value: summary.totalEnrollments },
      { id: 'courses', label: 'Cursos', value: summary.totalCourses },
      { id: 'school-cycles', label: 'Ciclos escolares', value: summary.activeCycles },
    ];
  } catch (err) {
    console.error('Error al cargar el agregador del dashboard:', err);
    // Fallback a peticiones individuales si el agregador falla (opcional, pero mejor manejar el error)
    const keys = ['users', 'students', 'teachers', 'enrollments', 'courses', 'school-cycles'];
    const selected = adminResources.filter((resource) => keys.includes(resource.id));
    const results = await Promise.allSettled(selected.map((resource) => listResource(resource, token)));

    return selected.map((resource, index) => {
      const res = results[index];
      let value = null;
      if (res.status === 'fulfilled') {
        const payload = res.value;
        value = payload?.totalElements ?? payload?.total ?? payload?.data?.totalElements ?? asList(payload).length;
        if (resource.id === 'school-cycles') {
          value = asList(payload).filter((cycle) => cycle.active === true || cycle.status === true).length;
        }
      }
      return {
        id: resource.id,
        label: resource.title,
        value,
        error: res.status === 'rejected' ? res.reason.message : null,
      };
    });
  }
}

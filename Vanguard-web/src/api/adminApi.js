import { apiRequest, asList } from './client';

const PAGE_QUERY = '?page=0&size=50&sort=id,desc';

export const adminResources = [
  {
    id: 'users',
    group: 'Seguridad',
    title: 'Usuarios',
    endpoint: `/users${PAGE_QUERY}`,
    manualLoad: true,
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
    endpoint: `/students${PAGE_QUERY}`,
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
    endpoint: `/tutors${PAGE_QUERY}`,
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
    endpoint: `/enrollments${PAGE_QUERY}`,
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
    endpoint: `/teacher-assignments${PAGE_QUERY}`,
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
    endpoint: `/schedules${PAGE_QUERY}`,
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
];

export function listResource(resource, token) {
  return apiRequest(resource.endpoint, { token }).then(asList);
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

export async function getAdminOverview(token) {
  const keys = ['students', 'teachers', 'enrollments', 'courses', 'school-cycles'];
  const selected = adminResources.filter((resource) => keys.includes(resource.id));
  const results = await Promise.allSettled(selected.map((resource) => listResource(resource, token)));

  return selected.map((resource, index) => ({
    id: resource.id,
    label: resource.title,
    value: results[index].status === 'fulfilled' ? results[index].value.length : null,
    error: results[index].status === 'rejected' ? results[index].reason.message : null,
  }));
}

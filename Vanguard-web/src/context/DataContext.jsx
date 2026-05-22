import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { listResource, createResource, updateResource, updateUserStatus, registerUser } from '../api/adminApi';
import { useAuth } from '../auth/AuthContext';
import { asList } from '../api/client';

const DataContext = createContext(null);
const SECURITY_PAGE_SIZE = 20;

function pageMeta(payload, fallbackLength = 0) {
  return {
    page: payload?.number ?? payload?.data?.number ?? 0,
    totalPages: payload?.totalPages ?? payload?.data?.totalPages ?? 1,
    totalElements: payload?.totalElements ?? payload?.data?.totalElements ?? fallbackLength,
  };
}

export function DataProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [people, setPeople] = useState({ students: [], teachers: [], tutors: [] });
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [grades, setGrades] = useState({});
  const [attendance, setAttendance] = useState({});
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [securityPagination, setSecurityPagination] = useState({
    users: { page: 0, totalPages: 1, totalElements: 0 },
    people: { page: 0, totalPages: 1, totalElements: 0 },
  });

  const addLog = useCallback((user, action, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), userId: user, action, type }, ...prev.slice(0, 99)]);
  }, []);

  const refreshSecurityData = useCallback(async ({ userPage = 0, peoplePage = 0, size = SECURITY_PAGE_SIZE } = {}) => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [uRes, rRes, sRes, tRes, tutRes] = await Promise.all([
        listResource({ endpoint: '/users' }, token, userPage, size),
        listResource({ endpoint: '/roles' }, token, 0, 100),
        listResource({ endpoint: '/students' }, token, peoplePage, size),
        listResource({ endpoint: '/teachers' }, token, peoplePage, size),
        listResource({ endpoint: '/tutors' }, token, peoplePage, size),
      ]);

      const nextUsers = asList(uRes);
      const nextStudents = asList(sRes);
      const nextTeachers = asList(tRes);
      const nextTutors = asList(tutRes);

      setUsers(nextUsers);
      setRoles(asList(rRes));
      setPeople({ students: nextStudents, teachers: nextTeachers, tutors: nextTutors });

      setSecurityPagination({
        users: pageMeta(uRes, nextUsers.length),
        people: {
          page: peoplePage,
          totalPages: Math.max(sRes?.totalPages ?? 1, tRes?.totalPages ?? 1, tutRes?.totalPages ?? 1),
          totalElements: (sRes?.totalElements ?? nextStudents.length)
            + (tRes?.totalElements ?? nextTeachers.length)
            + (tutRes?.totalElements ?? nextTutors.length),
        },
      });

      addLog('SYSTEM', 'Sincronizacion de seguridad completada', 'info');
    } catch (err) {
      addLog('SYSTEM', `Error de seguridad: ${err.message}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, addLog]);

  const refreshAcademicData = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [sRes, cRes, aRes, gRes, actRes, attRes] = await Promise.all([
        listResource({ endpoint: '/students' }, token),
        listResource({ endpoint: '/courses' }, token),
        listResource({ endpoint: '/teacher-assignments' }, token),
        listResource({ endpoint: '/grades-records' }, token),
        listResource({ endpoint: '/activities' }, token),
        listResource({ endpoint: '/attendance' }, token),
      ]);

      setPeople(prev => ({ ...prev, students: asList(sRes) }));
      setCourses(asList(cRes));
      setAssignments(asList(aRes));
      setActivities(asList(actRes));

      const normalizedGrades = {};
      asList(gRes).forEach((g) => {
        normalizedGrades[`${g.studentId}_${g.activityId}`] = g.scoreObtained;
      });
      setGrades(normalizedGrades);

      const normalizedAttendance = {};
      asList(attRes).forEach((a) => {
        const dateKey = new Date(a.attendanceDate).toDateString();
        normalizedAttendance[`${a.studentId}_${a.teacherAssignmentId}_${dateKey}`] = a.status.toLowerCase();
      });
      setAttendance(normalizedAttendance);

      addLog('SYSTEM', 'Sincronizacion academica completada', 'info');
    } catch (err) {
      addLog('SYSTEM', `Error academico: ${err.message}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, addLog]);

  const refreshData = refreshSecurityData;

  const resolveRoleId = async (roleName) => {
    const normalizedRole = String(roleName || '').trim().toUpperCase();
    let availableRoles = roles;
    if (availableRoles.length === 0) {
      availableRoles = asList(await listResource({ endpoint: '/roles' }, token, 0, 100));
      setRoles(availableRoles);
    }

    const roleRecord = availableRoles.find((item) => String(item.name || '').trim().toUpperCase() === normalizedRole);
    if (!roleRecord) throw new Error(`Rol no encontrado: ${roleName}`);
    return roleRecord.id;
  };

  const createUserReal = async (userData) => {
    const roleId = await resolveRoleId(userData.role);
    const response = await registerUser({
      username: userData.username,
      password: userData.password,
      roleId,
    }, token);
    await refreshSecurityData();
    return response;
  };

  const updateUserReal = async (id, data) => {
    const payload = { username: data.username };
    if (data.password) payload.password = data.password;
    if (data.role) payload.roleId = await resolveRoleId(data.role);

    await updateResource('users', id, payload, token);
    if (typeof data.status === 'boolean') {
      await updateUserStatus(id, data.status, token);
    }
    await refreshSecurityData();
  };

  const addPersonReal = async (type, data) => {
    const response = await createResource(type, data, token);
    await refreshSecurityData();
    return response;
  };

  const updatePersonReal = async (type, id, data) => {
    await updateResource(type, id, data, token);
    await refreshSecurityData();
  };

  const setStudentGrade = async (studentId, activityId, score, teacherName) => {
    try {
      await createResource('grades_records', { studentId, activityId, scoreObtained: score }, token);
      const key = `${studentId}_${activityId}`;
      setGrades(prev => ({ ...prev, [key]: parseFloat(score) || 0 }));
      addLog(teacherName, `Nota Registrada: ${score}`, 'update');
    } catch (err) {
      alert('Error al registrar nota: ' + err.message);
    }
  };

  const recordAttendance = async (studentId, assignmentId, date, status) => {
    try {
      const isoDate = new Date(date).toISOString().split('T')[0];
      await createResource({ id: 'attendance', endpoint: '/attendance' }, {
        studentId,
        teacherAssignmentId: assignmentId,
        attendanceDate: isoDate,
        status: status.toUpperCase(),
      }, token);

      const key = `${studentId}_${assignmentId}_${date}`;
      setAttendance(prev => ({ ...prev, [key]: status }));
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
    }
  };

  const getTeacherAssignments = useCallback((teacherId) => assignments
    .filter(a => a.teacherId === teacherId)
    .map(a => ({
      ...a,
      course: courses.find(c => c.id === a.courseId),
      activities: activities.filter(act => act.teacherAssignmentId === a.id),
    })), [assignments, courses, activities]);

  const getStudentCourses = useCallback((studentId) => assignments.map(a => ({
    ...a,
    course: courses.find(c => c.id === a.courseId),
    activities: activities.filter(act => act.teacherAssignmentId === a.id),
    grades: activities
      .filter(act => act.teacherAssignmentId === a.id)
      .reduce((acc, act) => {
        const score = grades[`${studentId}_${act.id}`];
        if (score !== undefined) acc[act.id] = score;
        return acc;
      }, {}),
  })), [assignments, courses, activities, grades]);

  const getStudentGradesForCourse = useCallback((studentId, assignmentId) => {
    const result = {};
    activities
      .filter(act => act.teacherAssignmentId === assignmentId)
      .forEach((act) => {
        const score = grades[`${studentId}_${act.id}`];
        if (score !== undefined) result[act.id] = score;
      });
    return result;
  }, [activities, grades]);

  const value = useMemo(() => ({
    users,
    roles,
    people,
    students: people.students,
    courses,
    assignments,
    activities,
    grades,
    attendance,
    logs,
    isLoading,
    securityPagination,
    createUser: createUserReal,
    updateUser: updateUserReal,
    addPerson: addPersonReal,
    updatePerson: updatePersonReal,
    setStudentGrade,
    recordAttendance,
    addLog,
    refreshData,
    refreshSecurityData,
    refreshAcademicData,
    getTeacherAssignments,
    getStudentCourses,
    getStudentGradesForCourse,
  }), [
    users, roles, people, courses, assignments, activities, grades, attendance, logs, isLoading, securityPagination,
    addLog, refreshData, refreshSecurityData, refreshAcademicData, getTeacherAssignments, getStudentCourses,
    getStudentGradesForCourse,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
};

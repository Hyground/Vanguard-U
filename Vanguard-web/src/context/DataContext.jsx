import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { listResource, createResource, updateResource, patchResource, updateUserStatus, registerUser, adminResources } from '../api/adminApi';
import { useAuth } from '../auth/AuthContext';
import { asList } from '../api/client';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { token, isAuthenticated, role } = useAuth();
  
  // --- ESTADO SINCRONIZADO CON LA API ---
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

  // --- CARGA INICIAL DESDE LA API ---
  const refreshData = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [uRes, rRes, sRes, tRes, tutRes, cRes, aRes, gRes, actRes, attRes] = await Promise.all([
        listResource({ endpoint: '/users' }, token),
        listResource({ endpoint: '/roles' }, token),
        listResource({ endpoint: '/students' }, token),
        listResource({ endpoint: '/teachers' }, token),
        listResource({ endpoint: '/tutors' }, token),
        listResource({ endpoint: '/courses' }, token),
        listResource({ endpoint: '/teacher-assignments' }, token),
        listResource({ endpoint: '/grades-records' }, token),
        listResource({ endpoint: '/activities' }, token),
        listResource({ endpoint: '/attendance' }, token),
      ]);

      setUsers(asList(uRes));
      setRoles(asList(rRes));
      setPeople({
        students: asList(sRes),
        teachers: asList(tRes),
        tutors: asList(tutRes)
      });
      setCourses(asList(cRes));
      setAssignments(asList(aRes));
      setActivities(asList(actRes));
      
      // Normalizar notas (grades_records)
      const rawGrades = asList(gRes);
      const normalizedGrades = {};
      rawGrades.forEach(g => {
        // La clave ahora es studentId_activityId para mayor precisión
        const key = `${g.studentId}_${g.activityId}`;
        normalizedGrades[key] = g.scoreObtained;
      });
      setGrades(normalizedGrades);

      // Normalizar asistencia
      const rawAttendance = asList(attRes);
      const normalizedAtt = {};
      rawAttendance.forEach(a => {
        const dateKey = new Date(a.attendanceDate).toDateString();
        const key = `${a.studentId}_${a.teacherAssignmentId}_${dateKey}`;
        normalizedAtt[key] = a.status.toLowerCase();
      });
      setAttendance(normalizedAtt);

      addLog('SYSTEM', 'Sincronización de datos completada', 'info');
    } catch (err) {
      addLog('SYSTEM', `Error de sincronización: ${err.message}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated, role, refreshData]);

  // --- ACCIONES CON PERSISTENCIA REAL ---
  
  const addLog = (user, action, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), userId: user, action, type }, ...prev.slice(0, 99)]);
  };

  const createUserReal = async (userData) => {
    const roleId = await resolveRoleId(userData.role);
    const response = await registerUser({
      username: userData.username,
      password: userData.password,
      roleId,
    }, token);
    await refreshData();
    return response;
  };

  const updateUserReal = async (id, data) => {
    const payload = {
      username: data.username,
    };
    if (data.password) payload.password = data.password;
    if (data.role) payload.roleId = await resolveRoleId(data.role);

    await updateResource('users', id, payload, token);
    if (typeof data.status === 'boolean') {
      await updateUserStatus(id, data.status, token);
    }
    await refreshData();
  };

  const addPersonReal = async (type, data) => {
    const response = await createResource(type, data, token);
    await refreshData();
    return response;
  };

  const updatePersonReal = async (type, id, data) => {
    await updateResource(type, id, data, token);
    await refreshData();
  };

  const resolveRoleId = async (roleName) => {
    const normalizedRole = String(roleName || '').trim().toUpperCase();
    let availableRoles = roles;
    if (availableRoles.length === 0) {
      availableRoles = asList(await listResource({ endpoint: '/roles' }, token));
      setRoles(availableRoles);
    }

    const roleRecord = availableRoles.find((item) => String(item.name || '').trim().toUpperCase() === normalizedRole);
    if (!roleRecord) {
      throw new Error(`Rol no encontrado: ${roleName}`);
    }
    return roleRecord.id;
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

  const recordAttendance = async (studentId, assignmentId, date, status, teacherName) => {
    try {
      // Convertir date string a ISO para el backend
      const isoDate = new Date(date).toISOString().split('T')[0];
      await createResource({ id: 'attendance', endpoint: '/attendance' }, { 
        studentId, 
        teacherAssignmentId: assignmentId, 
        attendanceDate: isoDate, 
        status: status.toUpperCase() 
      }, token);
      
      const key = `${studentId}_${assignmentId}_${date}`;
      setAttendance(prev => ({ ...prev, [key]: status }));
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
    }
  };

  // --- GETTERS RELACIONALES (Sincronizados) ---
  const getTeacherAssignments = useCallback((teacherId) => {
    return assignments
      .filter(a => a.teacherId === teacherId)
      .map(a => ({
        ...a,
        course: courses.find(c => c.id === a.courseId),
        activities: activities.filter(act => act.teacherAssignmentId === a.id)
      }));
  }, [assignments, courses, activities]);

  const getStudentCourses = useCallback((studentId) => {
    // Aquí filtramos las asignaciones donde el estudiante está inscrito
    // En un sistema real, esto vendría de /enrollments
    return assignments.map(a => ({
      ...a,
      course: courses.find(c => c.id === a.courseId),
      activities: activities.filter(act => act.teacherAssignmentId === a.id),
      grades: activities
        .filter(act => act.teacherAssignmentId === a.id)
        .reduce((acc, act) => {
          const score = grades[`${studentId}_${act.id}`];
          if (score !== undefined) acc[act.id] = score;
          return acc;
        }, {})
    }));
  }, [assignments, courses, activities, grades]);

  const getStudentGradesForCourse = useCallback((studentId, assignmentId) => {
    const result = {};
    activities
      .filter(act => act.teacherAssignmentId === assignmentId)
      .forEach(act => {
        const score = grades[`${studentId}_${act.id}`];
        if (score !== undefined) result[act.id] = score;
      });
    return result;
  }, [activities, grades]);

  const value = {
    users, roles, people, courses, assignments, activities, grades, attendance, logs, isLoading,
    createUser: createUserReal, 
    updateUser: updateUserReal, 
    addPerson: addPersonReal, 
    updatePerson: updatePersonReal,
    setStudentGrade, recordAttendance, addLog, refreshData,
    getTeacherAssignments, getStudentCourses, getStudentGradesForCourse
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
};

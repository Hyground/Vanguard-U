import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { listResource, createResource, updateResource, patchResource, adminResources } from '../api/adminApi';
import { useAuth } from '../auth/AuthContext';
import { asList } from '../api/client';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  
  // --- ESTADO SINCRONIZADO CON LA API ---
  const [users, setUsers] = useState([]);
  const [people, setPeople] = useState({ students: [], teachers: [], tutors: [] });
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});
  const [attendance, setAttendance] = useState({});
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- CARGA INICIAL DESDE LA API ---
  const refreshData = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [uRes, sRes, tRes, tutRes, cRes, aRes, gRes, schRes] = await Promise.all([
        listResource({ endpoint: '/users' }, token),
        listResource({ endpoint: '/students' }, token),
        listResource({ endpoint: '/teachers' }, token),
        listResource({ endpoint: '/tutors' }, token),
        listResource({ endpoint: '/courses' }, token),
        listResource({ endpoint: '/teacher-assignments' }, token),
        listResource({ endpoint: '/grades' }, token),
        listResource({ endpoint: '/schedules' }, token),
      ]);

      setUsers(asList(uRes));
      setPeople({
        students: asList(sRes),
        teachers: asList(tRes),
        tutors: asList(tutRes)
      });
      setCourses(asList(cRes));
      setAssignments(asList(aRes));
      
      // Normalizar notas (grades_records)
      const rawGrades = asList(gRes);
      const normalizedGrades = {};
      rawGrades.forEach(g => {
        // Asumiendo que la API devuelve studentId y teacherAssignmentId
        // Para el mock, mapeamos a nuestra estructura interna: studentId_assignmentId_activityId
        // Como no tenemos activityId real en el recurso genérico, usamos 'final' por defecto
        const key = `${g.studentId}_${g.teacherAssignmentId}_final`;
        normalizedGrades[key] = g.scoreObtained;
      });
      setGrades(normalizedGrades);

      addLog('SYSTEM', 'Sincronización con el Núcleo completada', 'info');
    } catch (err) {
      addLog('SYSTEM', `Error de sincronización: ${err.message}`, 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated, refreshData]);

  // --- ACCIONES CON PERSISTENCIA REAL ---
  
  const addLog = (user, action, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), userId: user, action, type }, ...prev.slice(0, 99)]);
  };

  const createUserReal = async (userData) => {
    const response = await createResource('users', userData, token);
    await refreshData();
    return response;
  };

  const updateUserReal = async (id, data) => {
    await patchResource('users', id, data, token);
    await refreshData();
  };

  const addPersonReal = async (type, data) => {
    const response = await createResource(type, data, token);
    await refreshData();
    return response;
  };

  const updatePersonReal = async (type, id, data) => {
    await patchResource(type, id, data, token);
    await refreshData();
  };

  const setStudentGrade = (studentId, assignmentId, activityId, score, teacherName) => {
    const key = `${studentId}_${assignmentId}_${activityId}`;
    setGrades(prev => ({ ...prev, [key]: parseFloat(score) || 0 }));
    addLog(teacherName, `Nota Registrada (Simulación): ${score}`, 'update');
    // En producción: await apiRequest('/grades', { method: 'POST', body: ... })
  };

  const recordAttendance = (studentId, assignmentId, date, status, teacherName) => {
    const key = `${studentId}_${assignmentId}_${date}`;
    setAttendance(prev => ({ ...prev, [key]: status }));
  };

  // --- GETTERS RELACIONALES (Sincronizados) ---
  const getTeacherAssignments = useCallback((teacherId) => {
    return assignments
      .filter(a => a.teacherId === teacherId)
      .map(a => ({
        ...a,
        course: courses.find(c => c.id === a.courseId)
      }));
  }, [assignments, courses]);

  const getStudentCourses = useCallback((studentId) => {
    return assignments.map(a => ({
      ...a,
      course: courses.find(c => c.id === a.courseId),
      grades: Object.keys(grades)
        .filter(key => key.startsWith(`${studentId}_${a.id}_`))
        .reduce((acc, key) => ({ ...acc, [key.split('_')[2]]: grades[key] }), {})
    }));
  }, [assignments, courses, grades]);

  const getStudentGradesForCourse = useCallback((studentId, courseId) => {
    const result = {};
    Object.keys(grades).forEach(key => {
      if (key.startsWith(`${studentId}_${courseId}_`)) {
        const activityId = key.split('_')[2];
        result[activityId] = grades[key];
      }
    });
    return result;
  }, [grades]);

  const value = {
    users, people, courses, assignments, grades, attendance, logs, isLoading,
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

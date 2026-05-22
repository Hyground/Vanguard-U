import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // 1. ESTADO: Cursos y Asignaciones
  const [courses, setCourses] = useState([
    { id: 1, name: 'Análisis de Sistemas I', code: 'AS1', instructor: 'Ing. Mario Robles', progress: 0 },
    { id: 2, name: 'Bases de Datos II', code: 'BD2', instructor: 'Ing. Lorena Méndez', progress: 0 },
    { id: 3, name: 'Compiladores', code: 'CMP', instructor: 'Ing. Jose Silva', progress: 0 },
    { id: 4, name: 'Sistemas Operativos II', code: 'SO2', instructor: 'Ing. Karina Lopez', progress: 0 },
    { id: 5, name: 'Arquitectura de Computadoras I', code: 'AR1', instructor: 'Ing. Roberto Giron', progress: 0 },
  ]);

  // 2. ESTADO: Alumnos por Sección (Simulando inscripciones)
  const [students, setStudents] = useState([
    { id: 5591, firstName: 'Carlos', lastName: 'Méndez', personalCode: 'ST-88271', attendance: 100, average: 0 },
    { id: 5592, firstName: 'Ana', lastName: 'García', personalCode: 'ST-99123', attendance: 100, average: 0 },
    { id: 5593, firstName: 'Luis', lastName: 'Rodríguez', personalCode: 'ST-11022', attendance: 100, average: 0 },
  ]);

  // 3. ESTADO: Matriz de Notas (grades_records)
  // Estructura: { studentId_courseId_activityId: score }
  const [grades, setGrades] = useState({
    '5591_1_act1': 8, '5591_1_act2': 12,
    '5592_1_act1': 10, '5592_1_act2': 15,
  });

  // 4. ESTADO: Asistencia (attendance)
  // Estructura: { studentId_date: status }
  const [attendance, setAttendance] = useState({});

  // 5. ESTADO: Auditoría (system_log)
  const [logs, setLogs] = useState([
    { id: 1, timestamp: new Date().toISOString(), user: 'System', action: 'Motor Académico Vanguard-U Iniciado', type: 'info' },
  ]);

  // --- ACCIONES DOCENTE ---
  
  const updateGrade = (studentId, courseId, activityId, score, userName) => {
    const key = `${studentId}_${courseId}_${activityId}`;
    setGrades(prev => ({ ...prev, [key]: parseFloat(score) || 0 }));
    
    addLog(userName, `Actualizó nota de actividad ${activityId} para alumno ${studentId} en curso ${courseId}`, 'update');
  };

  const markAttendance = (studentId, date, status, userName) => {
    const key = `${studentId}_${date}`;
    setAttendance(prev => ({ ...prev, [key]: status }));
    
    // Recalcular métrica de asistencia del alumno (Simulado)
    // En un sistema real esto sería un query complejo
  };

  const finalizeAttendance = (userName, courseName) => {
    addLog(userName, `Finalizó pase de lista para el curso: ${courseName}`, 'success');
  };

  // --- UTILIDADES ---

  const addLog = (user, action, type = 'info') => {
    setLogs(prev => [
      { id: Date.now(), timestamp: new Date().toISOString(), user, action, type },
      ...prev.slice(0, 49) // Mantener últimos 50
    ]);
  };

  const getStudentGradesForCourse = (studentId, courseId) => {
    // Filtra las notas que pertenezcan a ese alumno y curso
    const result = {};
    Object.keys(grades).forEach(key => {
      if (key.startsWith(`${studentId}_${courseId}_`)) {
        const activityId = key.split('_')[2];
        result[activityId] = grades[key];
      }
    });
    return result;
  };

  const value = {
    courses,
    students,
    grades,
    attendance,
    logs,
    updateGrade,
    markAttendance,
    finalizeAttendance,
    addLog,
    getStudentGradesForCourse
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
}

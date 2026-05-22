import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // --- 1. ESTADO DE SEGURIDAD Y USUARIOS ---
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', role: 'ADMIN', personId: null, status: true },
    { id: 2, username: 'mrobles', role: 'TEACHER', personId: 10, status: true },
    { id: 3, username: 'cmendez', role: 'STUDENT', personId: 101, status: true },
  ]);

  // --- 2. ESTADO DE PERSONAS (STUDENTS, TEACHERS, TUTORS) ---
  const [people, setPeople] = useState({
    students: [
      { id: 101, firstName: 'Carlos', lastName: 'Méndez', email: 'carlos@vanguard.edu', personalCode: 'ST-88271', tutorId: 301 },
      { id: 102, firstName: 'Ana', lastName: 'García', email: 'ana@vanguard.edu', personalCode: 'ST-99123', tutorId: 301 },
      { id: 103, firstName: 'Luis', lastName: 'Rodríguez', email: 'luis@vanguard.edu', personalCode: 'ST-11022', tutorId: 302 },
    ],
    teachers: [
      { id: 10, firstName: 'Mario', lastName: 'Robles', email: 'mario.robles@vanguard.edu', degree: 'Ingeniero en Sistemas' },
      { id: 11, firstName: 'Lorena', lastName: 'Méndez', email: 'lorena.m@vanguard.edu', degree: 'Magister en Ciencias' },
    ],
    tutors: [
      { id: 301, firstName: 'Roberto', lastName: 'Méndez', email: 'roberto.tutor@mail.com', phone: '5544-3322' },
      { id: 302, firstName: 'Elena', lastName: 'García', email: 'elena.tutor@mail.com', phone: '4433-2211' },
    ]
  });

  // --- 3. ESTADO ACADÉMICO (COURSES, ASSIGNMENTS) ---
  const [courses, setCourses] = useState([
    { id: 1, name: 'Análisis de Sistemas I', code: 'AS1', credits: 5 },
    { id: 2, name: 'Bases de Datos II', code: 'BD2', credits: 4 },
    { id: 3, name: 'Compiladores', code: 'CMP', credits: 5 },
    { id: 4, name: 'Sistemas Operativos II', code: 'SO2', credits: 4 },
    { id: 5, name: 'Arquitectura de Computadoras I', code: 'AR1', credits: 5 },
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, teacherId: 10, courseId: 1, section: 'A', schedule: '07:00 - 09:00' },
    { id: 2, teacherId: 10, courseId: 2, section: 'B', schedule: '09:00 - 11:00' },
    { id: 3, teacherId: 11, courseId: 3, section: 'A', schedule: '11:00 - 13:00' },
  ]);

  // --- 4. ESTADO DE RENDIMIENTO (GRADES, ATTENDANCE) ---
  // Key: studentId_assignmentId_activityId
  const [grades, setGrades] = useState({
    '101_1_act1': 8.5, '101_1_act2': 12, '101_1_exam': 20,
    '102_1_act1': 10, '102_1_act2': 15, '102_1_exam': 24,
  });

  // Key: studentId_assignmentId_date
  const [attendance, setAttendance] = useState({});

  // --- 5. AUDITORÍA (SYSTEM LOG) ---
  const [logs, setLogs] = useState([
    { id: 1, timestamp: new Date().toISOString(), userId: 'System', action: 'NÚCLEO VANGUARD-U INICIADO', type: 'info' },
  ]);

  // --- ACCIONES CORE ---

  const addLog = (user, action, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), userId: user, action, type }, ...prev.slice(0, 99)]);
  };

  // --- ADMIN: USUARIOS Y PERSONAS ---
  const createUser = (userData) => {
    const newUser = { ...userData, id: Date.now(), status: true };
    setUsers(prev => [...prev, newUser]);
    addLog('ADMIN', `CREÓ USUARIO: ${userData.username}`, 'auth');
    return newUser;
  };

  const updateUser = (id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    addLog('ADMIN', `ACTUALIZÓ USUARIO ID: ${id}`, 'update');
  };

  const updatePerson = (type, id, data) => {
    setPeople(prev => ({
      ...prev,
      [type]: prev[type].map(p => p.id === id ? { ...p, ...data } : p)
    }));
    addLog('ADMIN', `ACTUALIZÓ DATOS DE ${type.toUpperCase()} ID: ${id}`, 'update');
  };

  const addPerson = (type, data) => {
    const newId = Date.now();
    setPeople(prev => ({
      ...prev,
      [type]: [...prev[type], { ...data, id: newId }]
    }));
    addLog('ADMIN', `REGISTRÓ NUEVA PERSONA (${type}): ${data.firstName}`, 'update');
    return newId;
  };

  // --- TEACHER: NOTAS Y ASISTENCIA ---
  const setStudentGrade = (studentId, assignmentId, activityId, score, teacherName) => {
    const key = `${studentId}_${assignmentId}_${activityId}`;
    setGrades(prev => ({ ...prev, [key]: parseFloat(score) || 0 }));
    addLog(teacherName, `MODIFICÓ NOTA [ST:${studentId} | AS:${assignmentId} | ACT:${activityId}] -> ${score}`, 'update');
  };

  const recordAttendance = (studentId, assignmentId, date, status, teacherName) => {
    const key = `${studentId}_${assignmentId}_${date}`;
    setAttendance(prev => ({ ...prev, [key]: status }));
  };

  // --- GETTERS RELACIONALES ---
  const getTeacherAssignments = (teacherId) => {
    return assignments
      .filter(a => a.teacherId === teacherId)
      .map(a => ({
        ...a,
        course: courses.find(c => c.id === a.courseId)
      }));
  };

  const getStudentCourses = (studentId) => {
    // Simulando que todos los estudiantes están en las mismas secciones por simplicidad del mock
    return assignments.map(a => ({
      ...a,
      course: courses.find(c => c.id === a.courseId),
      grades: Object.keys(grades)
        .filter(key => key.startsWith(`${studentId}_${a.id}_`))
        .reduce((acc, key) => ({ ...acc, [key.split('_')[2]]: grades[key] }), {})
    }));
  };

  const value = {
    users, people, courses, assignments, grades, attendance, logs,
    createUser, updateUser, addPerson, updatePerson,
    setStudentGrade, recordAttendance, addLog,
    getTeacherAssignments, getStudentCourses
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de DataProvider');
  return context;
};

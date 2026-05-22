import React from 'react';
import { BookMarked, Calendar, GraduationCap, LayoutDashboard, TrendingUp, Clock3 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export function StudentDashboard({ onSelectCourse }) {
  const { user } = useAuth();
  const courses = [
    { id: 1, name: 'Análisis de Sistemas I', code: 'AS1', progress: 75, instructor: 'Ing. Robles' },
    { id: 2, name: 'Bases de Datos II', code: 'BD2', progress: 40, instructor: 'Ing. Méndez' },
    { id: 3, name: 'Compiladores', code: 'CMP', progress: 90, instructor: 'Ing. Silva' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-main">Panel Estudiante</h2>
          <p className="text-sec">Ciclo 2026 - {user?.firstName || user?.username}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4">
          <p className="text-lg font-mono font-bold text-accent">{user?.personalCode || 'ST-948572'}</p>
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent"><GraduationCap size={24} /></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-panel p-6 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 text-accent mb-2"><TrendingUp size={20}/> <span className="font-bold">Promedio</span></div>
          <p className="text-3xl font-black text-main">88.5</p>
        </div>
        <div className="cyber-panel p-6"><div className="font-bold text-success mb-2">Cursos</div><p className="text-3xl font-black text-main">5</p></div>
        <div className="cyber-panel p-6"><div className="font-bold text-warning mb-2">Asistencia</div><p className="text-3xl font-black text-main">96%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} onClick={() => onSelectCourse(course)} className="cyber-panel p-5 cursor-pointer hover:border-accent/50 transition-all group">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent uppercase mb-2 inline-block border border-accent/20">{course.code}</span>
            <h4 className="text-lg font-bold text-main group-hover:text-accent">{course.name}</h4>
            <p className="text-sm text-sec">{course.instructor}</p>
            <div className="mt-4 w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

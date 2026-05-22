import React from 'react';
import { Users, ClipboardCheck, GraduationCap, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export function TeacherDashboard({ onSelectAssignment }) {
  const { user } = useAuth();
  const assignments = [
    { id: 1, course: 'Análisis de Sistemas I', section: 'A', students: 42, pending: 5 },
    { id: 2, course: 'Bases de Datos II', section: 'B', students: 38, pending: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-main">Panel Docente</h2>
        <button className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> Nueva Actividad</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-panel p-6"><div className="text-accent font-bold mb-2">Alumnos</div><p className="text-4xl font-black">125</p></div>
        <div className="cyber-panel p-6"><div className="text-success font-bold mb-2">Asistencia</div><p className="text-4xl font-black">92%</p></div>
        <div className="cyber-panel p-6"><div className="text-warning font-bold mb-2">Calificaciones</div><p className="text-4xl font-black">17</p></div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck className="text-accent"/> Mis Asignaciones</h3>
        {assignments.map(item => (
          <div key={item.id} onClick={() => onSelectAssignment(item)} className="cyber-panel p-6 cursor-pointer hover:border-accent/50 transition-all flex justify-between items-center group">
            <div><h4 className="text-xl font-extrabold group-hover:text-accent">{item.course}</h4><p className="text-sm text-sec">Sección {item.section} • {item.students} Alumnos</p></div>
            <div className="flex items-center gap-4">{item.pending > 0 && <span className="bg-warning/10 text-warning px-3 py-1 rounded text-xs font-bold">{item.pending} pendientes</span>}<ChevronRight className="text-border group-hover:text-accent"/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

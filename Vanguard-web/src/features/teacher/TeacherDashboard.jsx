import React from 'react';
import { 
  Users, ClipboardCheck, GraduationCap, ChevronRight, Plus, Activity, TrendingUp, Calendar, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function TeacherDashboard({ onSelectAssignment }) {
  const { user } = useAuth();
  const { courses, students, grades, attendance } = useData();

  // Cálculo de métricas reales
  const totalStudents = students.length;
  const assignmentsCount = courses.length;
  
  // Simulación de cálculo de asistencia promedio (desde el contexto)
  const attendanceValues = Object.values(attendance);
  const avgAttendance = attendanceValues.length > 0 
    ? Math.round((attendanceValues.filter(v => v === 'present').length / attendanceValues.length) * 100)
    : 92;

  const stats = [
    { label: 'Alumnos Totales', value: totalStudents, icon: Users, color: 'accent' },
    { label: 'Asistencia Global', value: `${avgAttendance}%`, icon: Activity, color: 'success' },
    { label: 'Calificaciones Pend.', value: 17, icon: GraduationCap, color: 'warning' },
  ];

  return (
    <div className="space-y-10 page-transition">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Docente Verificado</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic">Control Panel v1.5</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">
            Panel <span className="text-accent">Académico</span>
          </h2>
          <p className="text-sec text-lg font-medium">Bienvenido, {user?.firstName || user?.username}. Gestión de secciones e indicadores de rendimiento.</p>
        </div>

        <button className="flex items-center gap-3 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 transition-all active:scale-95 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          Nueva Actividad
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-8 rounded-[2rem] premium-border group hover:border-accent/30 transition-all duration-500">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-sec uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-4xl font-black text-main tracking-tighter italic">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                stat.color === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : 
                stat.color === 'success' ? 'bg-success/10 text-success border-success/20' : 
                'bg-warning/10 text-warning border-warning/20'
              }`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-sec uppercase tracking-widest bg-base/40 p-2 rounded-xl w-fit">
              <TrendingUp size={12} className="text-success" /> +4.2% esta semana
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-main uppercase italic flex items-center gap-3">
            <ClipboardCheck className="text-accent" size={24} />
            Mis Asignaciones <span className="text-sec text-sm not-italic opacity-40 font-bold">({courses.length})</span>
          </h3>
          <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline underline-offset-8 transition-all">Ver Historial Completo</button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {courses.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelectAssignment(item)} 
              className="glass-panel p-8 rounded-[2.5rem] cursor-pointer hover:border-accent/40 transition-all duration-500 flex flex-col md:flex-row justify-between items-center group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-8 flex-1">
                <div className="w-16 h-16 rounded-[1.5rem] bg-base premium-border flex flex-col items-center justify-center text-center shadow-inner group-hover:bg-accent/5 transition-colors">
                  <span className="text-[10px] font-black text-accent uppercase">{item.code}</span>
                  <span className="text-xs font-bold text-sec">Secc. A</span>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-main uppercase italic group-hover:text-accent transition-colors duration-300">{item.name}</h4>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs text-sec font-bold uppercase tracking-widest">
                       <Users size={14} className="text-accent" /> {students.length} Estudiantes
                    </div>
                    <div className="flex items-center gap-2 text-xs text-sec font-bold uppercase tracking-widest">
                       <Calendar size={14} className="text-success" /> Lunes y Miércoles
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 md:mt-0">
                <div className="text-right hidden xl:block">
                  <p className="text-[10px] font-black text-sec uppercase tracking-widest">Estado</p>
                  <p className="text-xs font-bold text-success uppercase">En Curso • Unidad II</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-sec group-hover:text-accent group-hover:border-accent/40 transition-all duration-500 group-hover:translate-x-2">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

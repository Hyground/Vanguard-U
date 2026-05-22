import React, { useMemo } from 'react';
import { 
  Users, ClipboardCheck, GraduationCap, ChevronRight, Plus, Activity, TrendingUp, Calendar, ArrowRight, UserCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function TeacherDashboard({ onSelectAssignment }) {
  const { user } = useAuth();
  const { assignments, students, attendance, grades } = useData();

  // Métrica 1: Total Estudiantes Únicos vinculados a sus secciones
  const teacherStudentsCount = useMemo(() => {
    // En este mock, todos los alumnos están en las secciones
    return students.length;
  }, [students]);

  // Métrica 2: Porcentaje de Asistencia Promedio (Real)
  const attendanceRate = useMemo(() => {
    const values = Object.values(attendance);
    if (values.length === 0) return 94;
    const present = values.filter(v => v === 'present').length;
    return Math.round((present / values.length) * 100);
  }, [attendance]);

  // Métrica 3: Actividades con Calificaciones Registradas
  const gradesRegisteredCount = useMemo(() => {
    return Object.keys(grades).length;
  }, [grades]);

  const stats = [
    { label: 'Población Académica', value: teacherStudentsCount, icon: Users, color: 'accent', detail: 'Alumnos activos' },
    { label: 'Índice de Asistencia', value: `${attendanceRate}%`, icon: UserCheck, color: 'success', detail: 'Promedio mensual' },
    { label: 'Registros de Nota', value: gradesRegisteredCount, icon: GraduationCap, color: 'warning', detail: 'Sincronizados' },
  ];

  return (
    <div className="space-y-12 page-transition">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Catedrático Titular</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-60">Session active: 05:44:21</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">
            Panel de <span className="text-accent">Control</span>
          </h2>
          <p className="text-sec text-lg font-medium italic opacity-80 max-w-2xl">
            Bienvenido, Dr. {user?.username}. Supervisión de rendimiento académico y protocolos de presencialidad.
          </p>
        </div>

        <button className="flex items-center gap-4 bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/20 transition-all active:scale-95 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          Nueva Actividad
        </button>
      </header>

      {/* Dynamic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-10 rounded-[3rem] premium-border group hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 text-accent/5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <stat.icon size={120} strokeWidth={3} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">{stat.label}</p>
                      <p className="text-5xl font-black text-main tracking-tighter italic">{stat.value}</p>
                   </div>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                     stat.color === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : 
                     stat.color === 'success' ? 'bg-success/10 text-success border-success/20' : 
                     'bg-warning/10 text-warning border-warning/20'
                   }`}>
                      <stat.icon size={28} />
                   </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-sec uppercase tracking-widest bg-base/50 px-3 py-2 rounded-xl w-fit border border-border/40">
                   <TrendingUp size={12} className="text-success" /> {stat.detail}
                </div>
             </div>
          </div>
        ))}
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-3xl font-black text-main uppercase italic flex items-center gap-4">
              <ClipboardCheck className="text-accent" size={28} />
              Protocolos de Asignación <span className="text-sec text-sm not-italic opacity-40 font-bold font-mono">[{assignments.length}]</span>
           </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {assignments.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelectAssignment(item)} 
              className="glass-panel p-10 rounded-[2.5rem] cursor-pointer hover:border-accent/50 transition-all duration-500 flex flex-col xl:flex-row justify-between items-center group relative overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_70%)]"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-10 flex-1 w-full">
                <div className="w-20 h-20 rounded-[1.8rem] bg-base premium-border flex flex-col items-center justify-center text-center shadow-inner group-hover:bg-accent/10 transition-all duration-500 border-border/50">
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest">Sección</span>
                  <span className="text-3xl font-black text-main italic tracking-tighter">{item.section}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-main uppercase italic group-hover:text-accent transition-colors duration-500 tracking-tighter">
                    {item.course?.name || 'Curso No Vinculado'}
                  </h4>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-sec uppercase tracking-[0.2em]">
                       <Users size={16} className="text-accent opacity-40" /> 
                       {students.length} Operadores Activos
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-sec uppercase tracking-[0.2em]">
                       <Calendar size={16} className="text-success opacity-40" /> 
                       {item.schedule}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 mt-10 xl:mt-0 w-full xl:w-auto justify-between xl:justify-end">
                <div className="text-right space-y-1 hidden sm:block">
                  <p className="text-[10px] font-black text-sec uppercase tracking-widest opacity-40">Status del Módulo</p>
                  <p className="text-xs font-black text-success uppercase tracking-widest italic">Sincronización OK • Unidad II</p>
                </div>
                <div className="w-16 h-16 rounded-[1.5rem] border border-border/50 flex items-center justify-center text-sec group-hover:text-accent group-hover:border-accent/40 transition-all duration-500 group-hover:translate-x-3 bg-base/30 shadow-sm">
                  <ArrowRight size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

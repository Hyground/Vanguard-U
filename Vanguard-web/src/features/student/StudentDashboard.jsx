import React, { useMemo } from 'react';
import { 
  BookMarked, Calendar, GraduationCap, LayoutDashboard, TrendingUp, Clock3, ChevronRight, CheckCircle2, AlertCircle, ArrowRight, MessageSquare, Star, Zap
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function StudentDashboard({ onSelectCourse }) {
  const { user } = useAuth();
  const { people, assignments, grades, addLog, getStudentCourses } = useData();

  // Obtener cursos reales del estudiante
  const studentCourses = useMemo(() => getStudentCourses(user?.personId), [getStudentCourses, user?.personId]);

  // Cálculo de promedio general real
  const currentAverage = useMemo(() => {
    const studentGrades = Object.keys(grades)
      .filter(key => key.startsWith(`${user?.personId}_`))
      .map(key => grades[key]);
    
    if (studentGrades.length === 0) return 0;
    const totalPoints = studentGrades.reduce((a, b) => a + b, 0);
    const maxPoints = studentGrades.length * 100; // Asumiendo base 100 para visualización
    return (totalPoints / maxPoints) * 100;
  }, [grades, user?.personId]);

  const deadLines = [
    { title: 'Entrega de Proyecto Final', course: 'General', date: '30 Junio', timeLeft: 'En 1 mes' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 page-transition">
      
      {/* Columna Principal */}
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-black tracking-widest uppercase border border-accent/20">Portal del Estudiante</span>
              <span className="h-px w-6 bg-border/50" />
              <span className="text-sec text-[9px] font-mono tracking-tighter uppercase italic opacity-60">ID: {user?.personId || 'USR-001'}</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-main uppercase italic leading-none">
              Mi <span className="text-accent">Ecosistema</span>
            </h2>
            <p className="text-sec text-base font-medium opacity-80">Bienvenido, {user?.username}. Supervisión de hitos y rendimiento.</p>
          </div>

          <div className="glass-panel p-4 pr-8 rounded-[1.5rem] premium-border flex items-center gap-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full blur-2xl" />
             <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 relative z-10">
                <GraduationCap size={24} strokeWidth={2.5} />
             </div>
             <div className="relative z-10">
                <p className="text-[9px] font-black text-sec uppercase tracking-[0.2em]">Estatus Global</p>
                <p className="text-lg font-mono font-black text-main tracking-tighter">SINCRONIZADO</p>
             </div>
          </div>
        </header>

        {/* Métrica de Impacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-panel p-8 rounded-[2rem] premium-border bg-gradient-to-br from-accent/5 to-transparent group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-accent/5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <TrendingUp size={100} strokeWidth={3} />
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[10px]">
                    <TrendingUp size={16} /> Score Académico Global
                 </div>
                 <p className="text-5xl font-black text-main tracking-tighter italic">{currentAverage.toFixed(1)}<span className="text-xl opacity-20 ml-2 not-italic">pts</span></p>
                 <div className="flex items-center gap-2 text-[8px] font-black text-sec uppercase tracking-widest bg-base/60 p-2 rounded-xl w-fit border border-border/40">
                    <span className="text-success">+2.4%</span> Sincronización activa
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[2rem] premium-border flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-500 relative">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-[10px]">
                    <CheckCircle2 size={16} /> Estatus Administrativo
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-3xl font-black text-main uppercase italic leading-none">Activo</p>
                   <p className="text-[10px] font-bold text-sec uppercase tracking-widest mt-1">Ciclo Escolar 2026</p>
                 </div>
              </div>
              <button className="w-full bg-base/50 premium-border py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-sec hover:text-accent hover:border-accent/40 transition-all mt-6">
                 Ver Historial de Pagos
              </button>
           </div>
        </div>

        {/* Listado de Cursos */}
        <section className="space-y-6">
           <h3 className="text-2xl font-black text-main uppercase italic flex items-center gap-3">
              <BookMarked className="text-accent" size={24} />
              Mis Unidades Curriculares <span className="text-sec text-xs not-italic opacity-40 font-bold font-mono">[{studentCourses.length}]</span>
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentCourses.map(assignment => (
                <div 
                  key={assignment.id} 
                  onClick={() => onSelectCourse(assignment)}
                  className="glass-panel p-8 rounded-[2rem] premium-border hover:border-accent/50 transition-all duration-500 cursor-pointer group relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.03),transparent_50%)]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-[60px] group-hover:bg-accent/10 transition-all duration-700" />
                  
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="px-3 py-1 rounded-lg bg-base border border-border/80 text-[9px] font-black text-accent uppercase tracking-widest shadow-sm group-hover:border-accent/40 transition-all">
                           {assignment.course?.code || 'CUR-X'}
                        </div>
                        <div className="w-10 h-10 rounded-xl border border-border/40 flex items-center justify-center text-sec group-hover:text-accent group-hover:border-accent/40 transition-all duration-500 group-hover:translate-x-1 bg-base/40">
                          <ArrowRight size={18} strokeWidth={3} />
                        </div>
                     </div>

                     <div>
                        <h4 className="text-2xl font-black text-main uppercase italic tracking-tighter leading-tight group-hover:text-accent transition-colors duration-500">{assignment.course?.name || 'Cargando...'}</h4>
                        <p className="text-[10px] font-bold text-sec uppercase tracking-[0.2em] mt-1.5 opacity-50">Sección: {assignment.sectionId}</p>
                     </div>

                     <div className="space-y-2.5">
                        <div className="flex justify-between items-end text-[9px] font-black uppercase text-sec tracking-widest">
                           <span className="flex items-center gap-1.5 italic">Rendimiento <Zap size={8} className="text-accent" /></span>
                           <span className="text-main text-xs italic font-mono">
                              {Object.values(assignment.grades).length > 0 ? (Object.values(assignment.grades).reduce((a, b) => a + b, 0) / (Object.values(assignment.grades).length * 100) * 100).toFixed(0) : '0'}%
                           </span>
                        </div>
                        <div className="h-1.5 w-full bg-base rounded-full overflow-hidden shadow-inner premium-border">
                           <div 
                            className="h-full bg-gradient-to-r from-accent to-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all duration-1000" 
                            style={{ width: `${Object.values(assignment.grades).length > 0 ? (Object.values(assignment.grades).reduce((a, b) => a + b, 0) / (Object.values(assignment.grades).length * 100) * 100) : 0}%` }}
                           />
                        </div>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* Sidebar de Contexto (Widgets) */}
      <aside className="space-y-8 animate-in slide-in-from-right-8 duration-1000">
         
         {/* Widget 1: Deadlines */}
         <div className="glass-panel p-8 rounded-[2rem] premium-border space-y-6 shadow-xl bg-black/10">
            <h4 className="text-[11px] font-black text-main uppercase tracking-[0.3em] flex items-center gap-2">
               <Clock3 size={16} className="text-accent" /> Próximos Deadlines
            </h4>
            <div className="space-y-4">
               {deadLines.map((item, i) => (
                 <div key={i} className="p-4 rounded-[1.5rem] bg-base/40 premium-border group hover:border-accent/40 transition-all duration-500 cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">{item.course}</p>
                    <h5 className="text-xs font-black text-main uppercase italic leading-tight mb-3">{item.title}</h5>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-sec uppercase tracking-widest">
                          <Calendar size={10} className="opacity-40" /> {item.date}
                       </div>
                       <span className="text-[8px] font-black text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded-md border border-warning/20">{item.timeLeft}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full text-center text-[9px] font-black uppercase tracking-[0.4em] text-sec hover:text-accent transition-all duration-300">
               Full Audit
            </button>
         </div>

         {/* Widget 2: Recent Feedback */}
         <div className="glass-panel p-8 rounded-[2rem] premium-border space-y-6 border-accent/20 bg-accent/[0.01]">
            <h4 className="text-[11px] font-black text-main uppercase tracking-[0.3em] flex items-center gap-2">
               <MessageSquare size={16} className="text-accent" /> Feedback Reciente
            </h4>
            <div className="space-y-4">
               <div className="p-5 rounded-[1.5rem] bg-base/30 border border-accent/10 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-black text-[10px] shadow-lg">MR</div>
                     <div>
                        <p className="text-[10px] font-black text-main uppercase italic">Ing. Mario Robles</p>
                        <p className="text-[8px] text-sec font-bold uppercase tracking-widest opacity-60">Sistemas I</p>
                     </div>
                  </div>
                  <p className="text-[11px] text-sec italic leading-relaxed font-medium">
                    "El despliegue del diagrama de secuencia muestra un nivel superior de abstracción técnica."
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-accent/10 pt-3">
                     <span className="text-[10px] font-black text-emerald-400 italic">Score: 9.8 / 10</span>
                     <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
               </div>
            </div>
         </div>

         {/* Protocol Alerta */}
         <div className="p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/20 flex gap-4 animate-pulse">
            <AlertCircle size={20} className="text-rose-400 shrink-0" />
            <p className="text-[9px] font-black text-rose-400 uppercase leading-relaxed tracking-widest italic">
               El protocolo de evaluación final se activará pronto. Mantenga su solvencia.
            </p>
         </div>
      </aside>

    </div>
  );
}

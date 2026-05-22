import React, { useMemo } from 'react';
import { 
  BookMarked, Calendar, GraduationCap, LayoutDashboard, TrendingUp, Clock3, ChevronRight, CheckCircle2, AlertCircle, ArrowRight, MessageSquare, Star, Zap
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function StudentDashboard({ onSelectCourse }) {
  const { user } = useAuth();
  const { courses, students, grades, addLog } = useData();

  // Cálculo de promedio general real desde el motor relacional
  const currentAverage = useMemo(() => {
    const studentGrades = Object.keys(grades)
      .filter(key => key.startsWith(`${user?.personId || 101}_`))
      .map(key => grades[key]);
    
    if (studentGrades.length === 0) return 0;
    // Asumiendo escala base 10 para el cálculo de promedio en el mock
    return (studentGrades.reduce((a, b) => a + b, 0) / (studentGrades.length * 15)) * 100;
  }, [grades, user?.personId]);

  const deadLines = [
    { title: 'Diagrama de Clases UML', course: 'Análisis I', date: '25 Mayo', timeLeft: 'En 4 días' },
    { title: 'Normalización 3FN', course: 'Bases de Datos II', date: '28 Mayo', timeLeft: 'En 1 semana' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-12 page-transition">
      
      {/* Columna Principal */}
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Estudiante de Ingeniería</span>
              <span className="h-px w-8 bg-border/50" />
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-60">Matrícula 2026-A</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">
              Mi <span className="text-accent">Ecosistema</span>
            </h2>
            <p className="text-sec text-lg font-medium opacity-80">Bienvenido, {user?.username}. Supervisión de hitos y rendimiento bimestral.</p>
          </div>

          <div className="glass-panel p-6 pr-10 rounded-[2.5rem] premium-border flex items-center gap-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl" />
             <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 relative z-10">
                <GraduationCap size={32} strokeWidth={2.5} />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-sec uppercase tracking-[0.2em]">Código Personal</p>
                <p className="text-2xl font-mono font-black text-main tracking-tighter">ST-88441-B</p>
             </div>
          </div>
        </header>

        {/* Métrica de Impacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-panel p-10 rounded-[3rem] premium-border bg-gradient-to-br from-accent/5 to-transparent group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-accent/10 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <TrendingUp size={150} strokeWidth={3} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 text-accent font-black uppercase tracking-widest text-xs">
                    <TrendingUp size={20} /> Score Académico Global
                 </div>
                 <p className="text-7xl font-black text-main tracking-tighter italic">{currentAverage.toFixed(1)}<span className="text-2xl opacity-20 ml-2 not-italic">pts</span></p>
                 <div className="flex items-center gap-3 text-[10px] font-black text-sec uppercase tracking-widest bg-base/60 p-3 rounded-2xl w-fit border border-border/40">
                    <span className="text-success">+5.1%</span> Protocolo de mejora detectado
                 </div>
              </div>
           </div>

           <div className="glass-panel p-10 rounded-[3rem] premium-border flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-500 relative">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs">
                    <CheckCircle2 size={20} /> Estatus Administrativo
                 </div>
                 <div className="space-y-1">
                   <p className="text-4xl font-black text-main uppercase italic leading-none">Solvente</p>
                   <p className="text-xs font-bold text-sec uppercase tracking-widest mt-2">Próximo arancel: 05 Jun 2026</p>
                 </div>
              </div>
              <button className="w-full bg-base/50 premium-border py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-sec hover:text-accent hover:border-accent/40 transition-all mt-8">
                 Ejecutar Consulta de Cuenta
              </button>
           </div>
        </div>

        {/* Listado de Cursos */}
        <section className="space-y-8">
           <h3 className="text-3xl font-black text-main uppercase italic flex items-center gap-4">
              <BookMarked className="text-accent" size={28} />
              Mis Unidades Curriculares <span className="text-sec text-sm not-italic opacity-40 font-bold font-mono">[{courses.length}]</span>
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  onClick={() => onSelectCourse(course)}
                  className="glass-panel p-10 rounded-[3rem] premium-border hover:border-accent/50 transition-all duration-500 cursor-pointer group relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.03),transparent_50%)]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[80px] group-hover:bg-accent/10 transition-all duration-700" />
                  
                  <div className="space-y-8 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="px-4 py-1.5 rounded-xl bg-base border border-border/80 text-[10px] font-black text-accent uppercase tracking-widest shadow-sm group-hover:border-accent/40 transition-all">
                           {course.code}
                        </div>
                        <div className="w-14 h-14 rounded-2xl border border-border/40 flex items-center justify-center text-sec group-hover:text-accent group-hover:border-accent/40 transition-all duration-500 group-hover:translate-x-2 bg-base/40">
                          <ArrowRight size={22} strokeWidth={3} />
                        </div>
                     </div>

                     <div>
                        <h4 className="text-3xl font-black text-main uppercase italic tracking-tighter leading-tight group-hover:text-accent transition-colors duration-500">{course.name}</h4>
                        <p className="text-xs font-bold text-sec uppercase tracking-[0.2em] mt-2 opacity-50">Instructor: Ing. Robles</p>
                     </div>

                     <div className="space-y-3">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase text-sec tracking-widest">
                           <span className="flex items-center gap-2 italic">Progreso Bimestral <Zap size={10} className="text-accent" /></span>
                           <span className="text-main text-sm italic font-mono">75%</span>
                        </div>
                        <div className="h-2 w-full bg-base rounded-full overflow-hidden shadow-inner premium-border">
                           <div className="h-full bg-gradient-to-r from-accent to-indigo-500 w-3/4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000 group-hover:w-[85%]" />
                        </div>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* Sidebar de Contexto (Widgets) */}
      <aside className="space-y-10 animate-in slide-in-from-right-8 duration-1000">
         
         {/* Widget 1: Deadlines */}
         <div className="glass-panel p-10 rounded-[3rem] premium-border space-y-8 shadow-2xl bg-black/10">
            <h4 className="text-sm font-black text-main uppercase tracking-[0.3em] flex items-center gap-3">
               <Clock3 size={18} className="text-accent" /> Próximos Deadlines
            </h4>
            <div className="space-y-6">
               {deadLines.map((item, i) => (
                 <div key={i} className="p-6 rounded-[2rem] bg-base/40 premium-border group hover:border-accent/40 transition-all duration-500 cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5">{item.course}</p>
                    <h5 className="text-sm font-black text-main uppercase italic leading-tight mb-4">{item.title}</h5>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-sec uppercase tracking-widest">
                          <Calendar size={12} className="opacity-40" /> {item.date}
                       </div>
                       <span className="text-[10px] font-black text-warning uppercase bg-warning/10 px-2 py-1 rounded-lg border border-warning/20">{item.timeLeft}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full text-center text-[10px] font-black uppercase tracking-[0.4em] text-sec hover:text-accent transition-all duration-300">
               Audit Full Calendar
            </button>
         </div>

         {/* Widget 2: Recent Feedback */}
         <div className="glass-panel p-10 rounded-[3rem] premium-border space-y-8 border-accent/20 bg-accent/[0.01]">
            <h4 className="text-sm font-black text-main uppercase tracking-[0.3em] flex items-center gap-3">
               <MessageSquare size={18} className="text-accent" /> Feedback Reciente
            </h4>
            <div className="space-y-6">
               <div className="p-6 rounded-[2rem] bg-base/30 border border-accent/10 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-black text-xs shadow-lg">MR</div>
                     <div>
                        <p className="text-[11px] font-black text-main uppercase italic">Ing. Mario Robles</p>
                        <p className="text-[8px] text-sec font-bold uppercase tracking-widest opacity-60">Análisis de Sistemas I</p>
                     </div>
                  </div>
                  <p className="text-xs text-sec italic leading-relaxed font-medium">
                    "El despliegue del diagrama de secuencia muestra un nivel superior de abstracción técnica. Continúa operando con esta precisión."
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-accent/10 pt-4">
                     <span className="text-xs font-black text-emerald-400 italic">Score: 9.8 / 10</span>
                     <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
               </div>
            </div>
         </div>

         {/* Protocol Alerta */}
         <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 flex gap-5 animate-pulse">
            <AlertCircle size={24} className="text-rose-400 shrink-0" />
            <p className="text-[10px] font-black text-rose-400 uppercase leading-relaxed tracking-widest italic">
               El protocolo de evaluación final se activará en T-15 días. Asegúrese de mantener su solvencia financiera para evitar bloqueos de credenciales.
            </p>
         </div>
      </aside>

    </div>
  );
}

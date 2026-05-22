import React from 'react';
import { 
  BookMarked, Calendar, GraduationCap, LayoutDashboard, TrendingUp, Clock3, ChevronRight, CheckCircle2, AlertCircle, ArrowRight, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function StudentDashboard({ onSelectCourse }) {
  const { user } = useAuth();
  const { courses, students, grades } = useData();

  // Cálculo de promedio general real desde el contexto
  const studentGrades = Object.keys(grades)
    .filter(key => key.startsWith(`${user?.idUser || 5591}_`))
    .map(key => grades[key]);
  
  const currentAverage = studentGrades.length > 0 
    ? (studentGrades.reduce((a, b) => a + b, 0) / (studentGrades.length * 10)) * 100 // Simplificado
    : 88.5;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10 page-transition">
      
      {/* Main Content */}
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Estudiante Regular</span>
              <span className="h-px w-8 bg-border/50" />
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic">Academic Profile v1.5</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">
              Mi <span className="text-accent">Tablero</span>
            </h2>
            <p className="text-sec text-lg font-medium">Bienvenido de nuevo, {user?.firstName}. Ciclo Académico Mayo 2026.</p>
          </div>

          <div className="glass-panel p-4 pr-6 rounded-[2rem] premium-border flex items-center gap-6 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-inner">
               <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-sec uppercase tracking-[0.2em]">Código Estudiante</p>
              <p className="text-xl font-mono font-black text-main">{user?.personalCode || 'ST-948572'}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-panel p-8 rounded-[2rem] premium-border bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-accent/10 -rotate-12 group-hover:scale-110 transition-transform duration-700">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-widest text-xs">
                   <TrendingUp size={16} /> Promedio General
                </div>
                <p className="text-6xl font-black text-main tracking-tighter italic">{currentAverage.toFixed(1)}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-sec uppercase tracking-widest bg-base/50 p-2 rounded-xl w-fit">
                   <span className="text-success">+4.2%</span> bimestre anterior
                </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[2rem] premium-border group hover:border-success/30 transition-all">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 text-success font-black uppercase tracking-widest text-xs">
                    <CheckCircle2 size={16} /> Estado de Solvencia
                 </div>
                 <div className="space-y-1">
                   <p className="text-4xl font-black text-main uppercase italic">Solvente</p>
                   <p className="text-xs text-sec font-medium">Próximo arancel: 05 de Junio</p>
                 </div>
                 <button className="w-full bg-base/50 premium-border py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-sec hover:text-accent hover:border-accent/40 transition-all">
                    Ver Estado de Cuenta
                 </button>
              </div>
           </div>
        </div>

        <section className="space-y-6">
          <h3 className="text-2xl font-black text-main uppercase italic flex items-center gap-3">
             <BookMarked className="text-accent" size={24} />
             Mis Cursos Inscritos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => onSelectCourse(course)}
                className="glass-panel p-8 rounded-[2.5rem] premium-border hover:border-accent/40 transition-all duration-500 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all" />
                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-lg bg-base border border-border text-[10px] font-black text-accent uppercase tracking-widest">{course.code}</span>
                      <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-sec group-hover:text-accent group-hover:border-accent/40 transition-all group-hover:translate-x-1">
                        <ArrowRight size={18} />
                      </div>
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-main uppercase italic tracking-tight">{course.name}</h4>
                      <p className="text-xs text-sec font-bold uppercase tracking-widest mt-1 opacity-60">{course.instructor}</p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-sec tracking-widest">
                         <span>Progreso General</span>
                         <span className="text-main">75%</span>
                      </div>
                      <div className="h-1.5 w-full bg-base rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-accent w-3/4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 group-hover:w-[80%]" />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar Right: Widgets */}
      <aside className="space-y-8 animate-in slide-in-from-right-4 duration-700">
         
         {/* Por Hacer / Deadlines */}
         <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6">
            <h4 className="text-sm font-black text-main uppercase tracking-[0.2em] flex items-center gap-2">
               <Clock3 size={16} className="text-accent" /> Próximas Entregas
            </h4>
            <div className="space-y-4">
               {[1, 2].map(i => (
                 <div key={i} className="p-5 rounded-2xl bg-base border border-border group hover:border-accent/40 transition-all cursor-pointer">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Unidad II • Tarea</p>
                    <h5 className="text-xs font-black text-main leading-tight mb-3">Diagrama de Casos de Uso Avanzado</h5>
                    <div className="flex items-center justify-between text-[9px] font-bold text-sec uppercase">
                       <span className="flex items-center gap-1"><Calendar size={10} /> 25 Mayo</span>
                       <span className="text-warning">En 4 días</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-sec hover:text-main transition-colors">
               Ver Calendario Completo
            </button>
         </div>

         {/* Valoración Reciente */}
         <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6 border-accent/20 bg-accent/[0.02]">
            <h4 className="text-sm font-black text-main uppercase tracking-[0.2em] flex items-center gap-2">
               <MessageSquare size={16} className="text-accent" /> Feedback Reciente
            </h4>
            <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-base/50 border border-accent/10">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-black text-[10px]">MR</div>
                     <div>
                        <p className="text-[10px] font-black text-main uppercase">Ing. Mario Robles</p>
                        <p className="text-[8px] text-sec font-bold uppercase">Análisis de Sistemas I</p>
                     </div>
                  </div>
                  <p className="text-[11px] text-sec italic leading-relaxed">
                    "Excelente manejo de la notación UML en el ensayo. Sigue así."
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                     <span className="text-xs font-black text-success">Nota: 9.5 / 10</span>
                     <CheckCircle2 size={14} className="text-success" />
                  </div>
               </div>
            </div>
         </div>

         {/* Alerta del Sistema */}
         <div className="p-6 rounded-[2rem] bg-warning/5 border border-warning/20 flex gap-4">
            <AlertCircle size={20} className="text-warning shrink-0" />
            <p className="text-[10px] font-bold text-warning uppercase leading-tight tracking-widest">
               Recuerda que el cierre de actas es automático. No se aceptan entregas tardías.
            </p>
         </div>
      </aside>

    </div>
  );
}

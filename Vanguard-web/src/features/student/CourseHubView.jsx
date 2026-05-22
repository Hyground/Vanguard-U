import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, FileText, CheckCircle2, Clock, ArrowLeft, GraduationCap, BookOpen, User, Layout, AlertCircle, Info, Download, Lock, Star, Zap, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function CourseHubView({ course, onBack }) {
  const { user } = useAuth();
  const { grades } = useData();
  const [activeUnit, setActiveUnit] = useState(1);

  // Usar actividades reales de la asignación (course)
  const activities = useMemo(() => course.activities || [], [course.activities]);

  // Agrupar actividades por "unidad" o similar si existe, 
  // sino creamos una unidad virtual para la demo
  const units = useMemo(() => {
    if (activities.length === 0) return [];
    return [
      {
        id: 1,
        title: 'Ciclo Evaluativo Vigente',
        progress: Math.min(100, (Object.keys(course.grades).length / activities.length) * 100),
        activities: activities.map(act => ({
          ...act,
          score: grades[`${user?.personId}_${act.id}`]
        }))
      }
    ];
  }, [activities, course.grades, grades, user?.personId]);

  // Cálculo de nota acumulada real
  const totalScore = useMemo(() => {
    let sum = 0;
    activities.forEach(act => {
      const score = grades[`${user?.personId}_${act.id}`] || 0;
      sum += score;
    });
    return sum;
  }, [activities, grades, user?.personId]);

  return (
    <div className="space-y-12 page-transition">
      
      {/* Header Premium Refactorizado */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b border-border/50 pb-12">
        <div className="space-y-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-sec hover:text-accent transition-all group w-fit"
          >
            <div className="p-2.5 rounded-xl bg-card premium-border group-hover:border-accent/40 transition-all shadow-sm">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Protocolo de Retorno
          </button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-xl bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest border border-accent/20 shadow-sm">
                {course.course?.code || 'AS1'}
              </span>
              <span className="h-1 w-1 rounded-full bg-sec/30" />
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-40">CRN-MASTER: 48821-VNG</span>
            </div>
            <h2 className="text-7xl font-black tracking-tighter text-main uppercase italic leading-none">{course.course?.name || course.name}</h2>
            <div className="flex flex-wrap gap-8 text-xs text-sec font-bold uppercase tracking-[0.2em]">
               <div className="flex items-center gap-2.5"><User size={16} className="text-accent" /> Ing. Mario Robles</div>
               <div className="flex items-center gap-2.5"><BookOpen size={16} className="text-emerald-400" /> Semestre I - 2026</div>
               <div className="flex items-center gap-2.5"><Zap size={16} className="text-warning" /> 5 Créditos Académicos</div>
            </div>
          </div>
        </div>

        {/* Score Display Card */}
        <div className="glass-panel p-10 rounded-[3rem] premium-border min-w-[300px] bg-accent/[0.02] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 text-accent/5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
              <Star size={150} strokeWidth={3} />
           </div>
           <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">Performance Acumulado</p>
              <div className="flex items-baseline gap-3">
                 <span className="text-7xl font-black text-main italic tracking-tighter">{totalScore.toFixed(1)}</span>
                 <span className="text-xl font-bold text-sec uppercase opacity-30">/ 100</span>
              </div>
              <div className="mt-8 space-y-3">
                 <div className="h-2 w-full bg-base rounded-full overflow-hidden shadow-inner premium-border">
                    <div className="h-full bg-gradient-to-r from-accent to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${totalScore}%` }} />
                 </div>
                 <p className="text-[9px] font-black text-sec uppercase tracking-widest text-right italic">Sincronizado con el sistema docente</p>
              </div>
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        
        {/* Accordion List */}
        <div className="space-y-6">
           <h3 className="text-3xl font-black text-main uppercase italic flex items-center gap-4 px-2">
              <Layout className="text-accent" size={28} />
              Programa de Hitos <span className="text-sec text-sm not-italic opacity-40 font-mono">[{units.length} Unidades]</span>
           </h3>

           <div className="space-y-4">
              {units.map((unit) => (
                <div key={unit.id} className={`glass-panel rounded-[2.5rem] overflow-hidden premium-border transition-all duration-500 ${unit.locked ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-accent/40 shadow-lg'}`}>
                  <button 
                    onClick={() => setActiveUnit(activeUnit === unit.id ? null : unit.id)}
                    className={`w-full flex items-center justify-between p-10 transition-colors ${activeUnit === unit.id ? 'bg-accent/[0.03]' : 'bg-transparent'}`}
                  >
                    <div className="flex items-center gap-8">
                       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl ${
                         unit.progress === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-accent/20 text-accent border border-accent/30'
                       }`}>
                         {unit.locked ? <Lock size={24} /> : unit.id}
                       </div>
                       <div className="text-left space-y-1">
                          <h4 className="text-2xl font-black text-main uppercase italic tracking-tighter">{unit.title}</h4>
                          <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">
                            {unit.locked ? 'Acceso Restringido por Calendario' : `Estatus: ${unit.progress}% Completado • ${unit.activities.length} Actividades`}
                          </p>
                       </div>
                    </div>
                    {!unit.locked && (
                      <div className={`p-3 rounded-2xl border border-border/60 text-sec transition-transform duration-500 ${activeUnit === unit.id ? 'rotate-180 bg-accent/10 text-accent border-accent/20' : ''}`}>
                         <ChevronDown size={24} />
                      </div>
                    )}
                  </button>

                  {activeUnit === unit.id && !unit.locked && (
                    <div className="p-8 bg-black/20 space-y-4 animate-in slide-in-from-top-6 duration-500 border-t border-border/20">
                       {unit.activities.map((act) => {
                         const score = grades[`${user?.personId}_${act.id}`];
                         return (
                           <div key={act.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-base/40 premium-border group hover:border-accent/40 transition-all duration-300">
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${score !== undefined ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-card border-border/60 text-sec'}`}>
                                    <FileText size={22} strokeWidth={2.5} />
                                 </div>
                                 <div className="space-y-1">
                                    <h5 className="text-sm font-black text-main uppercase italic tracking-wide group-hover:text-accent transition-colors">{act.name}</h5>
                                    <p className="text-[10px] font-bold text-sec uppercase tracking-widest opacity-60">Ponderación: {act.weight} • Entrega: {act.date}</p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-8">
                                 <div className="text-right">
                                    {score !== undefined ? (
                                      <div className="flex items-center gap-4">
                                         <div className="space-y-0.5">
                                            <p className="text-2xl font-black text-main italic tracking-tighter leading-none">{score.toFixed(1)}</p>
                                            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Validado</p>
                                         </div>
                                         <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                            <CheckCircle2 size={20} />
                                         </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3 text-warning">
                                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">En Calificación</span>
                                         <Clock size={20} className="animate-spin-slow" />
                                      </div>
                                    )}
                                 </div>
                                 <button className="p-3 rounded-xl bg-card border border-border/60 text-sec hover:text-accent hover:border-accent/40 transition-all active:scale-90">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* Resources Sidebar */}
        <div className="space-y-10">
           <div className="glass-panel p-10 rounded-[3rem] premium-border border-emerald-500/20 bg-emerald-500/[0.01] space-y-8 shadow-2xl">
              <div className="flex items-center gap-4 text-emerald-400 border-b border-emerald-500/10 pb-6">
                 <ShieldCheck size={28} />
                 <h4 className="text-sm font-black uppercase tracking-[0.3em]">Bóveda de Recursos</h4>
              </div>
              <div className="space-y-4">
                 {['Syllabus_Oficial_2026.pdf', 'Libro_Sistemas_Modernos.vng', 'Recursos_Unidad_II.iso'].map((file, i) => (
                   <button key={i} className="w-full text-left p-5 rounded-2xl bg-base/50 border border-border/60 text-[10px] font-black text-sec uppercase tracking-widest hover:text-main hover:border-accent/40 transition-all flex items-center justify-between group">
                      <span className="truncate max-w-[200px] italic">{file}</span>
                      <Download size={14} className="group-hover:translate-y-0.5 transition-transform duration-300" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-accent/5 border border-accent/20 space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Info size={100} />
              </div>
              <div className="flex items-center gap-4 text-accent">
                 <Info size={24} />
                 <h5 className="font-black uppercase italic text-xs tracking-widest">Protocolo de Notas</h5>
              </div>
              <p className="text-xs text-sec leading-relaxed font-medium">
                Las calificaciones registradas por el docente son automáticas e irreversibles una vez que el bimestre ha sido cerrado por el sistema.
              </p>
           </div>
        </div>

      </section>

    </div>
  );
}

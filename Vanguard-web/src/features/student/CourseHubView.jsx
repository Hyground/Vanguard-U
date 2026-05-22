import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, FileText, CheckCircle2, Clock, ArrowLeft, GraduationCap, BookOpen, User, Layout, AlertCircle, Info, Download, Lock
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function CourseHubView({ course, onBack }) {
  const { user } = useAuth();
  const { getStudentGradesForCourse } = useData();
  const [activeUnit, setActiveUnit] = useState(1);

  // Obtener notas reales del motor de datos
  const realGrades = getStudentGradesForCourse(user?.idUser || 5591, course.id);

  const units = [
    {
      id: 1,
      title: 'Unidad I: Fundamentos y Metodologías',
      progress: 100,
      activities: [
        { id: 'act1', name: 'Ensayo sobre Metodologías Ágiles', weight: 10, date: '10 Mayo' },
        { id: 'act2', name: 'Mapa Mental: Ciclo de Vida', weight: 15, date: '15 Mayo' },
      ]
    },
    {
      id: 2,
      title: 'Unidad II: Análisis de Requerimientos',
      progress: 40,
      activities: [
        { id: 'exam', name: 'Examen Parcial I', weight: 25, date: '20 Mayo' },
        { id: 'act3', name: 'Diagramas de Casos de Uso (UML)', weight: 15, date: '30 Mayo' },
      ]
    },
    {
      id: 3,
      title: 'Unidad III: Modelado de Sistemas',
      progress: 0,
      locked: true,
      activities: [
        { id: 'act4', name: 'Modelado de Clases y Objetos', weight: 20, date: '15 Junio' },
      ]
    }
  ];

  const calculateTotal = () => {
    return Object.values(realGrades).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="space-y-10 page-transition">
      
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-sec hover:text-accent transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Tablero
          </button>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">
                {course.code}
              </span>
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-40">CRN: 48821-V</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">{course.name}</h2>
            <div className="flex items-center gap-6 text-sm text-sec font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2"><User size={16} className="text-accent" /> {course.instructor}</div>
               <div className="flex items-center gap-2"><BookOpen size={16} className="text-success" /> Ciclo I - 2026</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] premium-border min-w-[240px] bg-accent/[0.02] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={80} />
           </div>
           <p className="text-[10px] font-black text-sec uppercase tracking-[0.2em] mb-2">Rendimiento Actual</p>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-main italic tracking-tighter">{calculateTotal().toFixed(1)}</span>
              <span className="text-lg font-bold text-sec uppercase opacity-40">/ 100 pts</span>
           </div>
           <div className="mt-6 h-1.5 w-full bg-base rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: `${calculateTotal()}%` }} />
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        
        {/* Accordion Units */}
        <div className="space-y-6">
           <h3 className="text-2xl font-black text-main uppercase italic flex items-center gap-3">
              <Layout className="text-accent" size={24} />
              Programa de Unidades
           </h3>

           <div className="space-y-4">
              {units.map((unit) => (
                <div key={unit.id} className={`glass-panel rounded-[2rem] overflow-hidden premium-border transition-all duration-500 ${unit.locked ? 'opacity-50 grayscale' : 'hover:border-accent/30'}`}>
                  <button 
                    onClick={() => !unit.locked && setActiveUnit(activeUnit === unit.id ? null : unit.id)}
                    disabled={unit.locked}
                    className={`w-full flex items-center justify-between p-8 transition-colors ${activeUnit === unit.id ? 'bg-accent/5' : 'bg-transparent'}`}
                  >
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                         unit.progress === 100 ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'
                       }`}>
                         {unit.locked ? <Lock size={20} /> : unit.id}
                       </div>
                       <div className="text-left">
                          <h4 className="text-xl font-black text-main uppercase italic">{unit.title}</h4>
                          <p className="text-[10px] font-bold text-sec uppercase tracking-widest mt-1">
                            {unit.locked ? 'Contenido Bloqueado' : `${unit.activities.length} Actividades Académicas • ${unit.progress}%`}
                          </p>
                       </div>
                    </div>
                    {!unit.locked && (activeUnit === unit.id ? <ChevronUp size={24} className="text-sec" /> : <ChevronDown size={24} className="text-sec" />)}
                  </button>

                  {activeUnit === unit.id && !unit.locked && (
                    <div className="p-6 bg-black/20 space-y-3 animate-in slide-in-from-top-4 duration-300">
                       {unit.activities.map((act) => {
                         const score = realGrades[act.id];
                         return (
                           <div key={act.id} className="flex items-center justify-between p-5 rounded-2xl bg-base/50 premium-border group hover:border-accent/40 transition-all">
                              <div className="flex items-center gap-5">
                                 <div className={`p-3 rounded-xl ${score !== undefined ? 'bg-success/10 text-success' : 'bg-sec/10 text-sec'}`}>
                                    <FileText size={20} />
                                 </div>
                                 <div>
                                    <h5 className="text-sm font-black text-main uppercase group-hover:text-accent transition-colors">{act.name}</h5>
                                    <p className="text-[9px] font-bold text-sec uppercase tracking-[0.2em] mt-1">Peso: {act.weight} pts • Fecha: {act.date}</p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    {score !== undefined ? (
                                      <div className="flex items-center gap-3">
                                         <span className="text-xl font-black text-main italic tracking-tighter">{score}</span>
                                         <CheckCircle2 size={18} className="text-success" />
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-warning">
                                         <span className="text-[10px] font-bold uppercase tracking-widest">Pendiente</span>
                                         <Clock size={16} />
                                      </div>
                                    )}
                                 </div>
                                 <button className="p-2.5 rounded-xl bg-card border border-border text-sec hover:text-accent transition-all">
                                    <Download size={14} />
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
        <div className="space-y-8">
           <div className="glass-panel p-8 rounded-[2.5rem] premium-border border-success/20 bg-success/[0.02] space-y-6">
              <h4 className="text-sm font-black text-success uppercase tracking-[0.2em] flex items-center gap-2">
                 <GraduationCap size={16} /> Recursos Unidad II
              </h4>
              <div className="space-y-3">
                 {['Manual_UML_2.5.pdf', 'Guia_IEEE_830.docx', 'Video_Clase_CasosUso.mp4'].map((file, i) => (
                   <button key={i} className="w-full text-left p-4 rounded-2xl bg-base border border-border text-[10px] font-bold text-sec uppercase tracking-widest hover:text-main hover:border-accent/40 transition-all flex items-center justify-between group">
                      <span className="truncate max-w-[180px]">{file}</span>
                      <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 space-y-4">
              <div className="flex items-center gap-3 text-accent">
                 <Info size={20} />
                 <h5 className="font-black uppercase italic text-xs">Nota del Sistema</h5>
              </div>
              <p className="text-[11px] text-sec leading-relaxed font-medium">
                Las notas mostradas aquí son preliminares y están sujetas a la revisión final de coordinación.
              </p>
           </div>
        </div>

      </section>

    </div>
  );
}

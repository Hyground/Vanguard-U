import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, CheckCircle2, Clock, ArrowLeft, GraduationCap, BookOpen, User, Layout } from 'lucide-react';

export function CourseHubView({ course, onBack }) {
  const [activeUnit, setActiveUnit] = useState(1);
  const units = [
    { id: 1, title: 'Unidad I: Fundamentos', progress: 100, activities: [{ id: 101, name: 'Ensayo', weight: 10, score: 9.5, status: 'Graded' }] },
    { id: 2, title: 'Unidad II: Requerimientos', progress: 40, activities: [{ id: 201, name: 'UML', weight: 15, score: null, status: 'Pending' }] },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-sec hover:text-accent transition-colors"><ArrowLeft size={16} /> Volver</button>
      <header className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h2 className="text-4xl font-black text-main">{course.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sec text-sm"><User size={14}/> {course.instructor} <BookOpen size={14}/> Ciclo I - 2026</div>
        </div>
        <div className="cyber-panel p-4 bg-accent/5 min-w-[150px]">
          <p className="text-[10px] font-bold uppercase text-sec">Nota Acumulada</p>
          <p className="text-3xl font-black text-main">9.5 <span className="text-sm text-sec">/ 100</span></p>
        </div>
      </header>

      <div className="space-y-4">
        {units.map(unit => (
          <div key={unit.id} className="cyber-panel overflow-hidden border-none shadow-lg">
            <button onClick={() => setActiveUnit(activeUnit === unit.id ? null : unit.id)} className="w-full flex items-center justify-between p-6 bg-card hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-bold">{unit.id}</div>
                <div className="text-left"><h4 className="font-bold text-main">{unit.title}</h4><p className="text-xs text-sec">{unit.progress}% Completado</p></div>
              </div>
              {activeUnit === unit.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </button>
            {activeUnit === unit.id && (
              <div className="p-4 bg-black/20 space-y-2">
                {unit.activities.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-4 rounded-xl bg-base border border-border">
                    <div className="flex items-center gap-3"><FileText size={18} className="text-accent"/><span className="text-sm font-bold">{act.name}</span></div>
                    <div className="flex items-center gap-2">{act.score !== null ? <><span className="font-black">{act.score}</span><CheckCircle2 size={16} className="text-success"/></> : <Clock size={16} className="text-warning"/>}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

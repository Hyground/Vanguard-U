import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Clock } from 'lucide-react';

export function AcademicCalendar() {
  const [selectedDay, setSelectedDay] = useState(null);
  const events = [{ day: 5, title: 'Análisis I', type: 'class', time: '07:00' }];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-main">Calendario</h2>
        <div className="bg-card border border-border rounded-xl p-1 flex items-center font-bold px-4">Mayo 2026</div>
      </header>
      <div className="cyber-panel overflow-hidden border-none shadow-2xl">
        <div className="grid grid-cols-7 bg-black/20 border-b border-border">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => <div key={d} className="p-4 text-center text-[10px] font-bold text-sec uppercase tracking-[0.2em]">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map(d => (
            <div key={d} onClick={() => d === 5 && setSelectedDay(d)} className="min-h-[100px] p-2 border-r border-b border-border/30 hover:bg-white/[0.02] cursor-pointer">
              <span className="text-sm font-bold text-sec">{d}</span>
              {d === 5 && <div className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-accent/10 border-accent/20 text-accent truncate">07:00 Análisis I</div>}
            </div>
          ))}
        </div>
      </div>
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="cyber-panel w-full max-w-md p-8 relative">
            <button onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 text-sec"><X size={20}/></button>
            <h4 className="text-2xl font-black mb-6">Detalle del {selectedDay} de Mayo</h4>
            <div className="p-4 rounded-xl bg-base border border-border flex gap-4">
              <div className="bg-accent/10 text-accent p-2 rounded-lg"><BookOpen size={20}/></div>
              <div><p className="font-bold">Análisis I</p><p className="text-xs text-sec">07:00 AM • Clase</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

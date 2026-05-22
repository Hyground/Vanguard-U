import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, X, BookOpen, Clock, Calendar as CalendarIcon, Zap, AlertCircle, Info, Filter
} from 'lucide-react';

export function AcademicCalendar() {
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Mapeo dinámico de eventos (Simulando cruce de tablas schedules y activities)
  const events = [
    { day: 5, title: 'Análisis de Sistemas I', type: 'class', time: '07:00 - 09:00', instructor: 'Ing. Robles', room: 'Laboratorio 3' },
    { day: 5, title: 'Entrega: Ensayo Ágil', type: 'deadline', time: '23:59', weight: '10 pts' },
    { day: 12, title: 'Bases de Datos II', type: 'class', time: '09:00 - 11:00', instructor: 'Ing. Méndez', room: 'Aula 204' },
    { day: 15, title: 'Examen Parcial I: Compiladores', type: 'exam', time: '11:00 - 13:00', instructor: 'Ing. Silva', room: 'Auditorio Central' },
    { day: 20, title: 'Sistemas Operativos II', type: 'class', time: '18:00 - 20:00', instructor: 'Ing. Lopez', room: 'Virtual Meet' },
    { day: 25, title: 'Entrega: Proyecto UML', type: 'deadline', time: '23:59', weight: '15 pts' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const firstDayEmpty = Array.from({ length: 5 }, (_, i) => i); // Mayo 2026 inicia en Viernes (5)

  const getDayEvents = (day) => events.filter(e => e.day === day);

  return (
    <div className="space-y-8 page-transition">
      
      {/* Header Premium */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-main uppercase italic">Calendario <span className="text-accent">Maestro</span></h2>
          <p className="text-sec text-sm font-medium uppercase tracking-widest">Sincronización de Horarios y Entregas • Mayo 2026</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex p-1 bg-card premium-border rounded-xl shadow-lg">
              <button className="p-2 rounded-lg hover:bg-white/5 text-sec transition-colors"><ChevronLeft size={20} /></button>
              <div className="px-6 py-2 font-black text-main uppercase italic tracking-widest text-xs">Mayo 2026</div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-sec transition-colors"><ChevronRight size={20} /></button>
           </div>
           <button className="p-3 rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all">
              <Filter size={20} />
           </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-border shadow-2xl">
        <div className="grid grid-cols-7 bg-black/40 border-b border-border/50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="p-6 text-center text-[10px] font-black text-sec uppercase tracking-[0.4em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {firstDayEmpty.map(i => (
            <div key={`empty-${i}`} className="min-h-[160px] p-4 border-r border-b border-border/10 bg-black/5" />
          ))}
          {days.map(day => {
            const dayEvents = getDayEvents(day);
            const isToday = day === 21;

            return (
              <div 
                key={day} 
                onClick={() => dayEvents.length > 0 && setSelectedDay(day)}
                className={`min-h-[160px] p-4 border-r border-b border-border/10 transition-all relative group cursor-pointer hover:bg-accent/[0.02] ${isToday ? 'bg-accent/[0.05]' : ''}`}
              >
                <div className="flex justify-between items-start">
                   <span className={`text-sm font-black italic tracking-tighter ${isToday ? 'w-8 h-8 flex items-center justify-center bg-accent text-white rounded-xl shadow-lg shadow-accent/40' : 'text-sec group-hover:text-main'}`}>
                     {day}
                   </span>
                   {dayEvents.length > 0 && (
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   )}
                </div>

                <div className="mt-4 space-y-2">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`text-[9px] font-black p-2 rounded-lg border uppercase tracking-widest truncate ${
                        event.type === 'class' ? 'bg-accent/10 border-accent/20 text-accent' :
                        event.type === 'deadline' ? 'bg-warning/10 border-warning/20 text-warning' :
                        'bg-success/10 border-success/20 text-success'
                      }`}
                    >
                      {event.time.split(' ')[0]} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[8px] font-black text-sec uppercase tracking-widest pl-1">+{dayEvents.length - 2} eventos</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-8 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-sec">
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent/30 border border-accent" /> Clases Magistrales</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning/30 border border-warning" /> Entregas Académicas</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success/30 border border-success" /> Exámenes Oficiales</div>
      </div>

      {/* Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="glass-panel w-full max-w-xl p-10 rounded-[3rem] premium-border relative animate-in zoom-in-95 duration-500 shadow-2xl">
              <button 
                onClick={() => setSelectedDay(null)}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-base border border-border text-sec hover:text-main hover:rotate-90 transition-all duration-500"
              >
                <X size={24} />
              </button>

              <header className="mb-10 space-y-2">
                 <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.3em] text-xs">
                    <CalendarIcon size={18} /> Protocolo de Jornada
                 </div>
                 <h4 className="text-4xl font-black text-main uppercase italic tracking-tighter">Eventos del {selectedDay} de Mayo</h4>
                 <p className="text-sec font-medium">Cronograma detallado sincronizado con el Core Académico.</p>
              </header>

              <div className="space-y-6">
                 {getDayEvents(selectedDay).map((event, idx) => (
                   <div key={idx} className="flex items-start gap-6 p-6 rounded-3xl bg-base/50 border border-border group hover:border-accent/40 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         {event.type === 'class' ? <BookOpen size={60} /> : <Zap size={60} />}
                      </div>
                      <div className={`p-4 rounded-2xl border ${
                        event.type === 'class' ? 'bg-accent/10 border-accent/20 text-accent' :
                        event.type === 'deadline' ? 'bg-warning/10 border-warning/20 text-warning' :
                        'bg-success/10 border-success/20 text-success'
                      }`}>
                         {event.type === 'class' ? <BookOpen size={24} /> : <Zap size={24} />}
                      </div>
                      <div className="space-y-1 relative z-10 flex-1">
                         <div className="flex justify-between items-start">
                            <h5 className="text-lg font-black text-main uppercase italic">{event.title}</h5>
                            <span className="text-[10px] font-bold uppercase text-sec bg-card px-3 py-1 rounded-lg border border-border">{event.time}</span>
                         </div>
                         <p className="text-sm text-sec font-medium italic opacity-60">
                           {event.type === 'class' ? `Instructor: ${event.instructor} • ${event.room}` : `Ponderación: ${event.weight} • Entrega Digital`}
                         </p>
                         {event.type === 'class' && (
                           <div className="pt-4 flex gap-3">
                              <button className="px-4 py-2 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all">Acceder a Sesión</button>
                              <button className="px-4 py-2 rounded-xl bg-card border border-border text-sec text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Materiales</button>
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

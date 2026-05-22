import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, X, BookOpen, Clock, Calendar as CalendarIcon, Zap, AlertCircle, Info, Filter, MapPin, ExternalLink
} from 'lucide-react';

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Mayo 2026 default
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Mapeo dinámico de eventos (Simulando cruce de tablas schedules y activities)
  const events = [
    { month: 4, day: 5, title: 'Análisis de Sistemas I', type: 'class', time: '07:00 - 09:00', instructor: 'Ing. Robles', room: 'Laboratorio 3' },
    { month: 4, day: 5, title: 'Entrega: Ensayo Ágil', type: 'deadline', time: '23:59', weight: '10 pts' },
    { month: 4, day: 12, title: 'Bases de Datos II', type: 'class', time: '09:00 - 11:00', instructor: 'Ing. Méndez', room: 'Aula 204' },
    { month: 4, day: 15, title: 'Examen Parcial I: Compiladores', type: 'exam', time: '11:00 - 13:00', instructor: 'Ing. Silva', room: 'Auditorio Central' },
    { month: 4, day: 20, title: 'Sistemas Operativos II', type: 'class', time: '18:00 - 20:00', instructor: 'Ing. Lopez', room: 'Virtual Meet' },
    { month: 4, day: 25, title: 'Entrega: Proyecto UML', type: 'deadline', time: '23:59', weight: '15 pts' },
    { month: 5, day: 1, title: 'Inicio Unidad III', type: 'info', time: '08:00', room: 'General' },
  ];

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    
    return { days, blanks, monthName: monthNames[month], year };
  }, [currentDate]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDay(null);
  };

  const getDayEvents = (day) => events.filter(e => e.month === currentDate.getMonth() && e.day === day);

  return (
    <div className="space-y-10 page-transition">
      
      {/* Header Premium con Navegación */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-border/50 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-xs">
             <CalendarIcon size={18} /> Master Scheduler
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">
            Calendario <span className="text-accent">Académico</span>
          </h2>
          <p className="text-sec text-lg font-medium italic opacity-70">Sincronización global de sesiones magistrales y entregas digitales.</p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex p-2 bg-card/60 backdrop-blur-xl premium-border rounded-[1.8rem] shadow-2xl items-center">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-3 rounded-xl hover:bg-white/5 text-sec hover:text-accent transition-all active:scale-90"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
              <div className="px-10 py-2 text-center min-w-[220px]">
                 <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">{calendarData.year}</p>
                 <p className="text-2xl font-black text-main uppercase italic tracking-tighter">{calendarData.monthName}</p>
              </div>
              <button 
                onClick={() => changeMonth(1)}
                className="p-3 rounded-xl hover:bg-white/5 text-sec hover:text-accent transition-all active:scale-90"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
           </div>
           <button className="p-5 rounded-[1.5rem] bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all shadow-xl shadow-accent/5">
              <Filter size={24} />
           </button>
        </div>
      </header>

      {/* Grid del Calendario HD */}
      <div className="glass-panel rounded-[3.5rem] overflow-hidden premium-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />
        
        <div className="grid grid-cols-7 bg-black/40 border-b border-border/50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="p-8 text-center text-[10px] font-black text-sec uppercase tracking-[0.5em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarData.blanks.map(i => (
            <div key={`empty-${i}`} className="min-h-[180px] p-6 border-r border-b border-border/10 bg-black/[0.03] opacity-20" />
          ))}
          {calendarData.days.map(day => {
            const dayEvents = getDayEvents(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

            return (
              <div 
                key={day} 
                onClick={() => dayEvents.length > 0 && setSelectedDay(day)}
                className={`min-h-[180px] p-6 border-r border-b border-border/10 transition-all relative group cursor-pointer hover:bg-accent/[0.02] ${isToday ? 'bg-accent/[0.04]' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                   <span className={`text-base font-black italic tracking-tighter transition-all duration-500 ${isToday ? 'w-10 h-10 flex items-center justify-center bg-accent text-white rounded-2xl shadow-2xl shadow-accent/40 scale-110' : 'text-sec group-hover:text-main group-hover:scale-125'}`}>
                     {day}
                   </span>
                   {dayEvents.length > 0 && (
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#6366F1]" />
                        {dayEvents.length > 2 && <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse delay-75 shadow-[0_0_8px_#F59E0B]" />}
                     </div>
                   )}
                </div>

                <div className="space-y-2 relative z-10">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`text-[9px] font-black p-2.5 rounded-xl border uppercase tracking-[0.1em] truncate transition-all group-hover:translate-x-1 ${
                        event.type === 'class' ? 'bg-accent/10 border-accent/20 text-accent shadow-sm' :
                        event.type === 'deadline' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        event.type === 'exam' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        'bg-sec/10 border-sec/20 text-sec'
                      }`}
                    >
                      {event.time.split(' ')[0]} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[8px] font-black text-sec uppercase tracking-widest pl-2 italic opacity-40">+{dayEvents.length - 2} eventos más</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Legend UI */}
      <footer className="flex flex-wrap items-center justify-between gap-10 px-6">
         <div className="flex flex-wrap gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-sec">
            <div className="flex items-center gap-3 group cursor-default">
               <div className="w-4 h-4 rounded-lg bg-accent/20 border border-accent/40 shadow-lg group-hover:scale-125 transition-transform" /> 
               Sesiones Magistrales
            </div>
            <div className="flex items-center gap-3 group cursor-default">
               <div className="w-4 h-4 rounded-lg bg-rose-500/20 border border-rose-500/40 shadow-lg group-hover:scale-125 transition-transform" /> 
               Deadlines Digitales
            </div>
            <div className="flex items-center gap-3 group cursor-default">
               <div className="w-4 h-4 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shadow-lg group-hover:scale-125 transition-transform" /> 
               Evaluaciones Core
            </div>
         </div>
         <p className="text-[9px] font-black text-sec/30 uppercase tracking-[0.5em]">Synchronized with Atomic Clock v2.1</p>
      </footer>

      {/* Detail Modal Refactorizado HD */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="glass-panel w-full max-w-2xl p-12 rounded-[3.5rem] premium-border relative animate-in zoom-in-95 duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <button 
                onClick={() => setSelectedDay(null)}
                className="absolute top-10 right-10 p-4 rounded-[1.5rem] bg-base border border-border text-sec hover:text-main hover:rotate-90 transition-all duration-500 shadow-xl"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <header className="mb-12 space-y-3">
                 <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.4em] text-xs">
                    <Zap size={20} className="animate-pulse" /> Timeline de Jornada
                 </div>
                 <h4 className="text-5xl font-black text-main uppercase italic tracking-tighter">
                   Protocolo: {selectedDay} {calendarData.monthName}
                 </h4>
                 <p className="text-sec font-medium text-lg italic opacity-60">Visualización de procesos académicos programados.</p>
              </header>

              <div className="space-y-8 max-h-[450px] overflow-y-auto no-scrollbar pr-4">
                 {getDayEvents(selectedDay).map((event, idx) => (
                   <div key={idx} className="flex items-start gap-8 p-8 rounded-[2.5rem] bg-base/50 premium-border group hover:border-accent/50 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
                         {event.type === 'class' ? <BookOpen size={100} /> : <Zap size={100} />}
                      </div>
                      
                      <div className={`p-5 rounded-[1.8rem] border shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 ${
                        event.type === 'class' ? 'bg-accent/10 border-accent/30 text-accent shadow-accent/10' :
                        event.type === 'deadline' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                      }`}>
                         {event.type === 'class' ? <BookOpen size={32} /> : <Zap size={32} />}
                      </div>

                      <div className="space-y-3 relative z-10 flex-1">
                         <div className="flex justify-between items-start">
                            <h5 className="text-2xl font-black text-main uppercase italic tracking-tighter leading-none">{event.title}</h5>
                            <span className="text-[10px] font-black uppercase text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/20 shadow-inner">{event.time}</span>
                         </div>
                         <div className="flex flex-wrap gap-6 text-[10px] font-bold text-sec uppercase tracking-widest opacity-60 italic">
                            {event.type === 'class' ? (
                               <>
                                 <span className="flex items-center gap-2"><User size={14} /> {event.instructor}</span>
                                 <span className="flex items-center gap-2"><MapPin size={14} /> {event.room}</span>
                               </>
                            ) : (
                               <span className="flex items-center gap-2"><AlertCircle size={14} /> Entrega de Carácter Crítico • {event.weight}</span>
                            )}
                         </div>
                         {event.type === 'class' && (
                           <div className="pt-6 flex gap-4">
                              <button className="flex-1 py-4 rounded-[1.25rem] bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/30 hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn">
                                 Establecer Conexión <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                              </button>
                              <button className="px-6 py-4 rounded-[1.25rem] bg-card border border-border text-sec text-[10px] font-black uppercase tracking-[0.2em] hover:text-main hover:border-accent/40 active:scale-95 transition-all">Syllabus</button>
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

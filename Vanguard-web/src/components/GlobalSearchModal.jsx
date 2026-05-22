import React, { useState, useEffect } from 'react';
import { Search, Command, X, ArrowRight, Star, History, Sparkles } from 'lucide-react';

export function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setSearchQuery] = useState('');

  const suggestions = [
    { id: 'overview', label: 'Resumen del Sistema', category: 'Navegación' },
    { id: 'infra', label: 'Mapa de Infraestructura', category: 'Core' },
    { id: 'users', label: 'Gestión de Usuarios', category: 'Seguridad' },
    { id: 'courses', label: 'Mis Cursos Inscritos', category: 'Académico' },
    { id: 'calendar', label: 'Calendario Académico', category: 'Académico' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null; // El padre lo controla
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = suggestions.filter(s => 
    s.label.toLowerCase().includes(query.toLowerCase()) || 
    s.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
       <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] premium-border shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          
          <div className="p-6 border-b border-border/50 flex items-center gap-4 bg-card/50">
             <Search size={24} className="text-accent" />
             <input 
               autoFocus
               type="text" 
               placeholder="¿Qué protocolo desea ejecutar? (Ej. Infraestructura...)"
               className="bg-transparent border-none outline-none text-xl font-bold text-main w-full placeholder:text-sec/30 italic"
               value={query}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-base border border-border text-[10px] font-black text-sec">
                <span className="uppercase">Esc</span>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <div className="p-4 max-h-[450px] overflow-y-auto no-scrollbar">
             {query === '' && (
               <div className="p-4 mb-6">
                  <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <Sparkles size={12} className="text-accent" /> Sugerencias Inteligentes
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     {suggestions.slice(0, 4).map(s => (
                       <button 
                         key={s.id}
                         onClick={() => { onNavigate(s.id); onClose(); }}
                         className="flex items-center justify-between p-5 rounded-[1.5rem] bg-base border border-border group hover:border-accent/40 transition-all text-left"
                       >
                          <span className="text-xs font-black text-main uppercase italic">{s.label}</span>
                          <Star size={14} className="text-sec group-hover:text-accent transition-colors" />
                       </button>
                     ))}
                  </div>
               </div>
             )}

             <div className="space-y-2">
                {filtered.length > 0 ? filtered.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => { onNavigate(s.id); onClose(); }}
                    className="w-full flex items-center justify-between p-6 rounded-3xl hover:bg-accent/10 group transition-all"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-card premium-border flex items-center justify-center text-sec group-hover:text-accent transition-colors">
                           <Command size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-main uppercase italic tracking-tight">{s.label}</p>
                           <p className="text-[10px] font-bold text-sec uppercase tracking-widest mt-1 opacity-60">{s.category}</p>
                        </div>
                     </div>
                     <ArrowRight size={18} className="text-border group-hover:text-accent transition-all group-hover:translate-x-1" />
                  </button>
                )) : (
                  <div className="py-20 text-center space-y-4 opacity-20 italic">
                     <p className="text-sm font-bold uppercase tracking-[0.4em]">Sin coincidencias en el Core</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-base/80 p-6 border-t border-border/50 flex items-center justify-between">
             <div className="flex gap-6">
                <div className="flex items-center gap-2 text-[9px] font-black text-sec uppercase">
                   <div className="px-1.5 py-0.5 rounded bg-card border border-border">↑↓</div> Navegar
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-sec uppercase">
                   <div className="px-1.5 py-0.5 rounded bg-card border border-border">Enter</div> Seleccionar
                </div>
             </div>
             <p className="text-[9px] font-black text-accent uppercase tracking-widest animate-pulse">Vanguard Semantic Search active</p>
          </div>
       </div>
    </div>
  );
}

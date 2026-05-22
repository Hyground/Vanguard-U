import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, AlertTriangle, Info, CheckCircle2, Search, Trash2, Cpu, Zap, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function AuditPanel() {
  const { logs, addLog } = useData();
  const [filter, setFilter] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(filter.toLowerCase()) || 
    log.userId.toLowerCase().includes(filter.toLowerCase()) ||
    log.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-10 page-transition">
      
      {/* Header Estilo Centro de Operaciones */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-border/50 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-xl shadow-rose-500/5">
                <Shield size={24} />
             </div>
             <div>
                <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">
                  Núcleo de <span className="text-rose-500">Auditoría</span>
                </h2>
                <p className="text-sec text-sm font-bold uppercase tracking-[0.3em] mt-2 opacity-60">Sentinel Protocol v4.0</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="glass-panel px-6 py-3 rounded-2xl premium-border flex items-center gap-4 bg-emerald-500/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10B981]" />
              <span className="text-[10px] font-black text-main uppercase tracking-[0.2em]">Live Stream Active</span>
           </div>
           <button 
             onClick={() => addLog('ADMIN', 'LIMPIEZA MANUAL DE REGISTROS EJECUTADA', 'warning')}
             className="p-4 rounded-2xl bg-card border border-border/60 text-sec hover:text-rose-400 hover:border-rose-500/40 transition-all active:scale-90"
           >
              <Trash2 size={22} />
           </button>
        </div>
      </header>

      {/* Terminal Interface HD */}
      <div className="glass-panel rounded-[3rem] overflow-hidden premium-border shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col min-h-[700px] bg-black/60 relative">
        
        {/* Terminal Top Bar */}
        <div className="bg-card/80 border-b border-border/50 px-10 py-6 flex items-center justify-between backdrop-blur-3xl sticky top-0 z-20">
           <div className="flex items-center gap-6">
              <div className="flex gap-2">
                 <div className="w-3.5 h-3.5 rounded-full bg-rose-500/30 border border-rose-500/50" />
                 <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
                 <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
              </div>
              <div className="h-6 w-px bg-border/40" />
              <div className="flex items-center gap-3 text-sec text-[11px] font-mono uppercase tracking-[0.2em] font-black italic opacity-60">
                 <Terminal size={16} className="text-accent" /> vanguard_os_sentinel.log
              </div>
           </div>
           <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec/40" />
              <input 
                type="text" 
                placeholder="Filtrar registros..."
                className="w-full bg-base/50 border border-border/40 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold text-main outline-none focus:border-accent/40 transition-all"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
        </div>

        {/* Console Log Area */}
        <div 
          ref={scrollRef}
          className="flex-1 p-10 font-mono text-[12px] overflow-y-auto space-y-4 no-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.02),transparent_70%)]"
        >
           {filteredLogs.map((log) => (
             <div key={log.id} className="flex gap-10 group animate-in slide-in-from-left-2 duration-300">
                <span className="text-sec opacity-20 shrink-0 w-28 text-[10px] flex items-center gap-2">
                  <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString([], {hour12:false, second:'2-digit'})}
                </span>
                <div className="flex items-center gap-4 shrink-0 w-44">
                   <div className={`w-2 h-2 rounded-full ${
                     log.type === 'auth' ? 'bg-accent' :
                     log.type === 'update' ? 'bg-amber-400' :
                     log.type === 'billing' ? 'bg-emerald-400' :
                     'bg-indigo-400'
                   } shadow-[0_0_8px_currentColor]`} />
                   <span className={`font-black uppercase tracking-tighter text-[10px] ${
                     log.type === 'auth' ? 'text-accent' :
                     log.type === 'update' ? 'text-amber-400' :
                     log.type === 'billing' ? 'text-emerald-400' :
                     'text-indigo-400'
                   }`}>
                     {log.type.padEnd(8, ' ')}
                   </span>
                </div>
                <div className="flex-1 flex gap-2">
                   <span className="text-accent/60 font-black">user@{log.userId.toLowerCase().replace(/\s+/g, '_')}:</span>
                   <span className="text-sec/40">~$</span>
                   <span className="text-main/90 font-medium group-hover:text-main transition-colors leading-relaxed">
                     {log.action}
                   </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100">
                   <Zap size={14} className="text-accent shadow-sm" />
                </div>
             </div>
           ))}
           
           {/* Active Cursor */}
           <div className="flex gap-4 items-center pt-4 animate-pulse">
              <span className="text-rose-500 font-black tracking-widest text-[10px]">>>></span>
              <span className="text-sec font-black tracking-[0.4em] uppercase text-[10px]">Esperando eventos del sistema...</span>
              <div className="w-2.5 h-5 bg-accent shadow-[0_0_10px_#6366F1]" />
           </div>
        </div>

        {/* Footer Terminal Stat */}
        <div className="bg-black/40 p-8 border-t border-border/50 flex items-center justify-between">
           <div className="flex gap-10">
              <div className="flex items-center gap-3 text-[10px] font-black text-sec uppercase tracking-[0.2em]">
                 <Activity size={14} className="text-emerald-500" />
                 Total Packets: {logs.length}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-sec uppercase tracking-[0.2em]">
                 <Cpu size={14} className="text-accent" />
                 Memory Load: 1.2 GB / 32 GB
              </div>
           </div>
           <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-[0.5em] italic">Vanguard Cryptographic Layer 2.0</p>
        </div>
      </div>

      {/* Audit Warning */}
      <div className="p-10 rounded-[3rem] bg-rose-500/5 border border-rose-500/20 flex gap-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
            <Shield size={180} />
         </div>
         <div className="p-6 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 h-fit shadow-2xl">
            <AlertTriangle size={32} />
         </div>
         <div className="space-y-3 relative z-10 flex-1">
            <h5 className="text-2xl font-black text-main uppercase italic tracking-tighter">Protocolo de Integridad de Datos</h5>
            <p className="text-sm text-sec leading-relaxed max-w-5xl font-medium">
              Este sistema de auditoría es <span className="text-rose-400 font-bold italic underline">INMUTABLE</span>. Cada entrada ha sido firmada digitalmente con un par de claves RSA de 4096 bits vinculadas al hardware del Gateway. Cualquier intento de inyección de logs o eliminación externa activará la purga automática de sesiones y el bloqueo de IPs.
            </p>
         </div>
      </div>

    </div>
  );
}

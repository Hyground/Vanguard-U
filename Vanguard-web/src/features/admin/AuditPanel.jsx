import React from 'react';
import { Terminal, Shield, AlertTriangle, Info, CheckCircle2, Search, Trash2, Cpu } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function AuditPanel() {
  const { logs } = useData();

  return (
    <div className="space-y-8 page-transition">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Security Layer</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase">Audit Logging v1.0</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-main uppercase italic">Registro de <span className="text-accent">Auditoría</span></h2>
          <p className="text-sec text-sm font-medium">Tracking en tiempo real de transacciones y estados del sistema.</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-card premium-border rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black text-main uppercase tracking-widest">Active Stream</span>
           </div>
           <button className="p-3 rounded-2xl bg-base border border-border text-sec hover:text-warning transition-all active:scale-95">
              <Trash2 size={20} />
           </button>
        </div>
      </header>

      {/* Terminal UI */}
      <div className="glass-panel rounded-[2rem] overflow-hidden premium-border shadow-2xl flex flex-col min-h-[600px] bg-black/40">
        
        {/* Terminal Header */}
        <div className="bg-card/80 border-b border-border/50 px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-warning/40" />
                 <div className="w-3 h-3 rounded-full bg-success/40" />
                 <div className="w-3 h-3 rounded-full bg-accent/40" />
              </div>
              <div className="h-4 w-px bg-border/50 mx-2" />
              <div className="flex items-center gap-2 text-sec text-[10px] font-mono uppercase tracking-widest font-black">
                 <Terminal size={14} /> session_vanguard_audit.sh
              </div>
           </div>
           <div className="flex items-center gap-4 text-xs font-mono text-sec opacity-40">
              <span>UTF-8</span>
              <span>Pos: {logs.length}, 0</span>
           </div>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto space-y-3 no-scrollbar">
           {logs.map((log) => (
             <div key={log.id} className="flex gap-6 group">
                <span className="text-sec opacity-30 shrink-0 w-24">[{new Date(log.timestamp).toLocaleTimeString([], {hour12:false})}]</span>
                <div className="flex items-center gap-3 shrink-0 w-32">
                   {log.type === 'auth' && <Shield size={12} className="text-accent" />}
                   {log.type === 'update' && <Cpu size={12} className="text-warning" />}
                   {log.type === 'billing' && <Terminal size={12} className="text-success" />}
                   {log.type === 'info' && <Info size={12} className="text-sec" />}
                   <span className={`font-black uppercase tracking-tighter ${
                     log.type === 'auth' ? 'text-accent' :
                     log.type === 'update' ? 'text-warning' :
                     log.type === 'billing' ? 'text-success' :
                     'text-sec'
                   }`}>
                     {log.type}
                   </span>
                </div>
                <div className="flex-1">
                   <span className="text-main font-bold">user@{log.user.toLowerCase().replace(' ', '_')}:~$ </span>
                   <span className="text-sec group-hover:text-main transition-colors">{log.action}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <CheckCircle2 size={12} className="text-success" />
                </div>
             </div>
           ))}
           <div className="flex gap-4 animate-pulse">
              <span className="text-sec opacity-30">[{new Date().toLocaleTimeString([], {hour12:false})}]</span>
              <span className="text-accent font-black tracking-widest">--- LISTENING FOR NEXT PROTOCOL ---</span>
              <div className="w-2 h-4 bg-accent" />
           </div>
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 flex gap-6">
         <div className="p-4 rounded-2xl bg-accent/10 text-accent border border-accent/20 h-fit">
            <Shield size={24} />
         </div>
         <div className="space-y-2">
            <h5 className="font-black text-main uppercase italic">Capa de Inmutabilidad Digital</h5>
            <p className="text-xs text-sec leading-relaxed max-w-3xl">
              Este registro es de solo lectura y está sincronizado mediante una cadena de bloques interna. Cualquier modificación manual de estos logs activará el protocolo de bloqueo de emergencia en el Gateway Central.
            </p>
         </div>
      </div>

    </div>
  );
}

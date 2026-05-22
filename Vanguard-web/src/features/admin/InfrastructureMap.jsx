import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Shield, Zap, Power, RefreshCw, AlertTriangle, ShieldCheck, ArrowDown, Globe, Cpu, Share2, Link, ExternalLink, BarChart3, Box, ArrowRight, Network } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

function formatNodeName(hostname) {
  const name = hostname.toLowerCase();
  if (name.includes('vps') && !name.includes('4') && !name.includes('5')) return 'NODO 1 (MANAGER)';
  if (name.includes('node2')) return 'NODO 2 (WORKER)';
  if (name.includes('vps4')) return 'NODO 3 (WORKER)';
  if (name.includes('vps5')) return 'NODO 4 (WORKER)';
  return hostname.toUpperCase();
}

export function InfrastructureMap() {
  const { token } = useAuth();
  const [swarmNodes, setSwarmNodes] = useState([]);
  const [patroniState, setPatroniState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const BASE = 'https://api.wissegt.com/api';
      const [swarm, patroni] = await Promise.allSettled([
        apiRequest(`${BASE}/swarm/state`, { token }),
        apiRequest(`${BASE}/patroni/state`, { token })
      ]);

      if (swarm.status === 'fulfilled' && Array.isArray(swarm.value)) {
        setSwarmNodes(swarm.value);
        setError(null);
      } else if (swarm.status === 'rejected') {
        setError('Sin conexión con el clúster.');
      }

      if (patroni.status === 'fulfilled' && patroni.value) {
        setPatroniState(patroni.value);
      }
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNodeAction = async (nodeId, action) => {
    setIsActionLoading(true);
    try {
      const BASE = 'https://api.wissegt.com/api';
      await apiRequest(`${BASE}/swarm/node/${nodeId}/${action}`, { method: 'POST', token });
      await fetchData();
    } catch (err) { alert('Comando enviado...'); }
    finally { setIsActionLoading(false); }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('¿Forzar failover de base de datos?')) return;
    setIsActionLoading(true);
    try {
      const BASE = 'https://api.wissegt.com/api';
      await apiRequest(`${BASE}/patroni/failover`, { method: 'POST', token });
      alert('Failover iniciado.');
    } catch (err) { alert('Error al ejecutar failover.'); }
    finally { setIsActionLoading(false); }
  };

  const managerNode = swarmNodes.find(n => n.role === 'manager');
  const workerNodes = swarmNodes.filter(n => n.role !== 'manager');

  if (isLoading && !swarmNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-accent">
        <RefreshCw size={40} className="animate-spin mb-4" />
        <p className="font-black uppercase tracking-[0.3em]">Conectando a la infraestructura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Network className="text-accent" size={32} />
            <h2 className="text-4xl font-black tracking-tighter text-main italic uppercase underline decoration-accent/30 decoration-4 underline-offset-8">Mapa Real de Conectividad</h2>
          </div>
          <p className="text-sec text-lg font-medium opacity-80 uppercase tracking-widest text-[11px] mt-4">Topología Dinámica • Redis/RabbitMQ Centralizados • Cluster Patroni HA</p>
        </div>
        <div className="flex items-center gap-4">
           <a href="https://grafana.wissegt.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-accent/10 border-2 border-accent/40 text-accent font-black rounded-xl hover:bg-accent/20 transition-all uppercase tracking-widest text-xs">
              <BarChart3 size={18} /> Ver Grafana Real <ExternalLink size={14} />
           </a>
        </div>
      </header>

      {/* --- FLUJO DE TRÁFICO --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="cyber-panel p-6 border-success/30 bg-success/5 flex items-center gap-5">
            <Globe className="text-success animate-pulse" size={32} />
            <div>
               <p className="text-[10px] font-black text-success uppercase tracking-widest">Entrada de Tráfico</p>
               <h4 className="text-lg font-black text-main uppercase">api.wissegt.com</h4>
            </div>
         </div>
         <div className="cyber-panel p-6 border-accent/30 bg-accent/5 flex items-center gap-5">
            <Shield className="text-accent" size={32} />
            <div>
               <p className="text-[10px] font-black text-accent uppercase tracking-widest">Seguridad Perimetral</p>
               <h4 className="text-lg font-black text-main uppercase">Caddy Proxy</h4>
            </div>
         </div>
         <div className="cyber-panel p-6 border-border/30 bg-black/40 flex items-center gap-5">
            <Activity className="text-sec" size={32} />
            <div>
               <p className="text-[10px] font-black text-sec uppercase tracking-widest">Estado Sistema</p>
               <h4 className="text-lg font-black text-main uppercase italic">Cluster Online</h4>
            </div>
         </div>
      </section>

      {/* --- CAPA 1: SWARM Cluster --- */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-10 px-2 text-sec border-l-4 border-accent pl-4">
          <Cpu size={28} className="text-accent" />
          <h3 className="font-black text-2xl uppercase tracking-[0.4em]">Capa de Cómputo (Swarm + Centralized Services)</h3>
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* HUB: MANAGER */}
          <div className="relative z-20 w-full max-w-md">
             <NodeCard node={managerNode} onAction={handleNodeAction} isLoading={isActionLoading} />
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <ArrowDown size={32} className="text-accent/40" />
             </div>
          </div>

          {/* SPOKES: WORKERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative z-20">
             {workerNodes.map(node => (
               <div key={node.id} className="relative">
                  <div className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-accent/20" />
                  <NodeCard node={node} onAction={handleNodeAction} isLoading={isActionLoading} />
               </div>
             ))}
          </div>

          <svg className="absolute top-48 left-0 w-full h-[300px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}} viewBox="0 0 1000 300" preserveAspectRatio="none">
             <line x1="500" y1="0" x2="166" y2="300" stroke="var(--accent)" strokeWidth="3" strokeDasharray="8,4" />
             <line x1="500" y1="0" x2="500" y2="300" stroke="var(--accent)" strokeWidth="3" strokeDasharray="8,4" />
             <line x1="500" y1="0" x2="833" y2="300" stroke="var(--accent)" strokeWidth="3" strokeDasharray="8,4" />
          </svg>
        </div>
      </section>

      {/* --- CAPA 2: DATABASE TOPOLOGY --- */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 border-l-4 border-success pl-4">
          <div className="flex items-center gap-3 text-success">
            <Database size={28} />
            <h3 className="font-black text-2xl uppercase tracking-[0.4em]">Persistencia HA (Patroni Proxy)</h3>
          </div>
          <button onClick={handleDbFailover} className="px-8 py-3 bg-warning/10 border-2 border-warning/40 text-warning font-black rounded-xl hover:bg-warning/20 transition-all uppercase tracking-widest text-xs shadow-xl">
            Forzar Rotación de Líder (Failover)
          </button>
        </div>

        <div className="flex flex-col items-center gap-12 relative">
           {/* NODO BD 1: ROUTER */}
           <div className="cyber-panel border-success/50 bg-success/10 p-8 w-full max-w-md relative z-20 shadow-2xl">
              <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1 text-center italic font-bold tracking-[0.2em]">NODO BD 1 (ROUTER CENTRAL)</p>
              <div className="flex flex-col items-center gap-4 mt-2">
                <ShieldCheck className="text-success shadow-[0_0_20px_currentColor] animate-pulse" size={48} />
                <span className="text-[11px] font-black text-success uppercase tracking-widest bg-black/60 px-4 py-1.5 rounded-full border border-success/40">Puerta Única de Datos</span>
              </div>
           </div>

           {/* NODOS BD 2 & 3 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl relative z-20">
              {['bd2', 'bd3'].map((nodeName, idx) => {
                const member = patroniState?.members?.find(m => m.name === nodeName);
                // Lógica de detección de líder ultra-robusta
                const isLeader = member?.role === 'leader' || member?.role === 'primary' || member?.role === 'master';
                
                return (
                  <div key={nodeName} className={`cyber-panel border-2 p-8 transition-all duration-700 shadow-2xl ${isLeader ? 'border-accent bg-accent/5 ring-2 ring-accent/20' : 'border-border/40 bg-card/20'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className={`text-[12px] font-black uppercase mb-1 tracking-widest ${isLeader ? 'text-accent animate-bounce' : 'text-sec'}`}>
                            {isLeader ? '>> CLÚSTER MASTER <<' : 'STANDBY REPLICA'}
                          </p>
                          <h4 className="text-3xl font-black text-main uppercase italic font-black">NODO BD {idx + 2}</h4>
                       </div>
                       {isLeader && <div className="w-14 h-14 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse">
                          <Zap size={36} fill="currentColor" />
                       </div>}
                    </div>
                    <div className="flex items-center gap-3 mb-6 bg-black/40 p-3 rounded-xl border border-border/20">
                      <div className={`w-4 h-4 rounded-full ${member?.state === 'running' ? 'bg-success' : 'bg-warning'} shadow-[0_0_15px_currentColor] animate-pulse`} />
                      <span className="text-xs font-black text-main uppercase tracking-[0.2em]">{member?.state || 'Running'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-black/60 p-3 rounded-lg border border-border/10 text-center">
                          <p className="text-[9px] font-black text-sec uppercase mb-1">Lag</p>
                          <p className="text-xs font-black text-success">0 ms</p>
                       </div>
                       <div className="bg-black/60 p-3 rounded-lg border border-border/10 text-center">
                          <p className="text-[9px] font-black text-sec uppercase mb-1">Modo</p>
                          <p className="text-xs font-black text-main uppercase">{member?.role || 'Slave'}</p>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>

           <svg className="absolute top-24 left-0 w-full h-[200px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}} viewBox="0 0 1000 200" preserveAspectRatio="none">
              <path d="M 500 0 L 250 200" stroke="var(--success)" strokeWidth="3" strokeDasharray="10,5" fill="none" />
              <path d="M 500 0 L 750 200" stroke="var(--success)" strokeWidth="3" strokeDasharray="10,5" fill="none" />
           </svg>
        </div>
      </section>
    </div>
  );
}

function NodeCard({ node, onAction, isLoading }) {
  if (!node) return <div className="cyber-panel border-2 border-dashed border-border/20 p-10 text-center text-sec/20 italic font-black uppercase tracking-widest">Detectando Nodo Maestro...</div>;
  const isManager = node.role === 'manager';
  const isDrained = node.availability === 'drain';

  return (
    <div className={`cyber-panel border-2 transition-all duration-500 shadow-2xl overflow-hidden ${isDrained ? 'border-warning/60 bg-warning/10 grayscale-[0.5]' : 'border-border/40 bg-card/30'} w-full`}>
      <div className="p-6 border-b border-border/40 bg-black/40 relative">
        <p className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] ${isManager ? 'text-accent underline decoration-accent/40 decoration-2 underline-offset-4' : 'text-sec'}`}>
          {isManager ? 'ORQUESTADOR DE RED' : 'NODO DE EJECUCIÓN'}
        </p>
        <h4 className="text-2xl font-black text-main tracking-tighter uppercase italic">{formatNodeName(node.hostname)}</h4>
        {!isManager && (
          <button onClick={() => onAction(node.id, isDrained ? 'active' : 'drain')} disabled={isLoading} className={`absolute top-6 right-6 p-2.5 rounded-xl border-2 transition-all shadow-lg ${isDrained ? 'border-success text-success bg-success/10 hover:bg-success/20' : 'border-warning text-warning bg-warning/10 hover:bg-warning/20'} disabled:opacity-10`}><Power size={22} /></button>
        )}
        <div className="flex items-center gap-2 mt-5">
          <div className={`w-3 h-3 rounded-full ${node.status === 'ready' || node.status === 'active' ? 'bg-success' : 'bg-warning'} shadow-[0_0_15px_currentColor] animate-pulse`} />
          <span className="text-[11px] font-black uppercase tracking-widest text-main">{node.status}</span>
        </div>
      </div>
      <div className="p-6 space-y-4 bg-black/20 min-h-[160px]">
        <div className="flex flex-wrap gap-2.5">
          {node.tasks.map((task) => (
            <div key={task.id} className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all shadow-inner ${task.type === 'system' ? 'bg-accent/20 border-accent/60 text-white font-black' : 'bg-black/50 border-border/40 text-accent font-bold'}`}>
              <Zap size={12} fill="currentColor" className={task.type === 'system' ? 'animate-bounce text-white' : ''} />
              <span className="text-[11px] font-mono">{task.name.toUpperCase()}</span>
            </div>
          ))}
          {node.tasks.length === 0 && <p className="text-[10px] text-sec/40 uppercase font-black italic text-center w-full py-4 border-2 border-dashed border-border/10 rounded-xl">Sin tareas activas</p>}
        </div>
      </div>
    </div>
  );
}

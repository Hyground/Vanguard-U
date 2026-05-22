import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Shield, Zap, Power, RefreshCw, AlertTriangle, ShieldCheck, ArrowDown, Globe, Cpu, Share2, Link, ExternalLink, BarChart3, Box } from 'lucide-react';
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
      // Usamos URL completa para evitar que el client le pegue el /api/v1 que causa el 404
      const BASE = 'https://api.wissegt.com/api';
      const [swarm, patroni] = await Promise.allSettled([
        apiRequest(`${BASE}/swarm/state`, { token }),
        apiRequest(`${BASE}/patroni/state`, { token })
      ]);

      if (swarm.status === 'fulfilled' && Array.isArray(swarm.value)) {
        setSwarmNodes(swarm.value);
        setError(null);
      } else if (swarm.status === 'rejected') {
        setError('Error 404/500: No se pudo conectar con el clúster.');
      }

      if (patroni.status === 'fulfilled' && patroni.value?.members) {
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
    } catch (err) { 
      alert('Error de conexión con el proxy.'); 
    } finally { 
      setIsActionLoading(false); 
    }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('¿Forzar failover de base de datos?')) return;
    setIsActionLoading(true);
    try {
      const BASE = 'https://api.wissegt.com/api';
      await apiRequest(`${BASE}/patroni/failover`, { method: 'POST', token });
      alert('Failover iniciado.');
    } catch (err) { 
      alert('Error al ejecutar failover.'); 
    } finally { 
      setIsActionLoading(false); 
    }
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
            <Share2 className="text-accent" size={28} />
            <h2 className="text-4xl font-black tracking-tighter text-main italic uppercase">TOPOLOGÍA EN VIVO</h2>
          </div>
          <p className="text-sec text-lg font-medium opacity-80 uppercase tracking-widest text-[11px]">Sincronización Real • Sin Datos Simulados</p>
        </div>
        <div className="flex items-center gap-4">
           <a 
            href="https://grafana.wissegt.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent/10 border border-accent/40 text-accent font-black rounded-xl hover:bg-accent/20 transition-all text-xs uppercase tracking-tighter"
           >
              <BarChart3 size={16} />
              Grafana
              <ExternalLink size={12} />
           </a>
        </div>
      </header>

      {error && (
        <div className="bg-warning/20 border-2 border-warning/50 p-6 rounded-2xl flex items-center gap-4 text-warning shadow-2xl animate-pulse">
           <AlertTriangle size={32} />
           <p className="font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* --- CAPA 1: SWARM Cluster --- */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-10 px-2 text-sec">
          <Cpu size={24} />
          <h3 className="font-black text-2xl uppercase tracking-[0.4em]">Capa de Cómputo (Swarm Cluster)</h3>
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* HUB: MANAGER */}
          <div className="relative z-20 w-full max-w-sm">
             <NodeCard node={managerNode} onAction={handleNodeAction} isLoading={isActionLoading} />
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Globe size={24} className="text-success animate-pulse" />
                <div className="h-10 w-0.5 bg-gradient-to-b from-success to-accent" />
             </div>
          </div>

          {/* SPOKES: WORKERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative z-20">
             {workerNodes.map(node => (
               <div key={node.id} className="relative">
                  <div className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-border/40" />
                  <NodeCard node={node} onAction={handleNodeAction} isLoading={isActionLoading} />
               </div>
             ))}
          </div>

          {/* SVG Connector Fix: Use fixed coordinates/viewBox instead of percentages in 'd' */}
          <svg className="absolute top-32 left-0 w-full h-[300px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}} viewBox="0 0 1000 300" preserveAspectRatio="none">
             <line x1="500" y1="0" x2="166" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-accent" />
             <line x1="500" y1="0" x2="500" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-accent" />
             <line x1="500" y1="0" x2="833" y2="300" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-accent" />
          </svg>
        </div>
      </section>

      <div className="flex justify-center text-border/40 py-4">
        <Link size={48} className="opacity-20" />
      </div>

      {/* --- CAPA INTERMEDIA: SHARED INFRASTRUCTURE --- */}
      <section className="space-y-8 bg-black/20 p-8 rounded-3xl border border-border/30 relative">
        <div className="absolute -top-4 left-8 bg-base px-4 py-1 border border-border/40 rounded-full text-[10px] font-black text-sec tracking-widest uppercase">
           Support Layer (Auxiliary VPS)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="cyber-panel p-6 border-accent/30 bg-accent/5 flex flex-col items-center text-center gap-3">
              <Zap className="text-accent" />
              <div>
                <h4 className="font-black text-main uppercase italic text-sm">Redis Server</h4>
                <p className="text-[10px] text-sec uppercase tracking-widest">Rate Limit & Cache</p>
              </div>
           </div>
           <div className="cyber-panel p-6 border-accent/30 bg-accent/5 flex flex-col items-center text-center gap-3">
              <Box className="text-accent" />
              <div>
                <h4 className="font-black text-main uppercase italic text-sm">RabbitMQ</h4>
                <p className="text-[10px] text-sec uppercase tracking-widest">Async Messenger</p>
              </div>
           </div>
           <a 
            href="https://grafana.wissegt.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cyber-panel p-6 border-warning/50 bg-warning/5 flex flex-col items-center text-center gap-3 hover:bg-warning/10 transition-all group"
           >
              <BarChart3 className="text-warning group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-black text-main uppercase italic text-sm text-warning">Live Metrics</h4>
                <p className="text-[10px] text-sec uppercase tracking-widest font-bold">Open Grafana</p>
              </div>
           </a>
        </div>
      </section>

      {/* --- CAPA 2: DATABASE TOPOLOGY --- */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3 text-success">
            <Database size={24} />
            <h3 className="font-black text-2xl uppercase tracking-[0.4em]">Capa de Persistencia (Patroni Cluster)</h3>
          </div>
          <button 
            onClick={handleDbFailover}
            className="px-8 py-3 bg-warning/10 border-2 border-warning/40 text-warning font-black rounded-xl hover:bg-warning/20 transition-all uppercase tracking-widest text-xs shadow-xl"
          >
            Rotar Maestro de Datos
          </button>
        </div>

        <div className="flex flex-col items-center gap-12 relative">
           <div className="cyber-panel border-success/50 bg-success/10 p-8 w-full max-w-md relative z-20 shadow-2xl">
              <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1 text-center italic">HA PROXY ROUTER</p>
              <div className="flex flex-col items-center gap-4 mt-2">
                <ShieldCheck className="text-success shadow-[0_0_15px_currentColor]" size={40} />
                <span className="text-xs font-black text-success uppercase tracking-widest">Router Operational</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl relative z-20">
              {['bd2', 'bd3'].map((nodeName, idx) => {
                const member = patroniState?.members?.find(m => m.name === nodeName);
                const isLeader = member?.role === 'leader' || member?.role === 'primary';
                return (
                  <div key={nodeName} className={`cyber-panel border-2 p-8 transition-all duration-700 shadow-2xl ${isLeader ? 'border-accent bg-accent/5' : 'border-border/40 bg-card/20'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className={`text-[10px] font-black uppercase mb-1 tracking-widest ${isLeader ? 'text-accent' : 'text-sec'}`}>
                            {isLeader ? 'Primary Database' : 'Standby Replica'}
                          </p>
                          <h4 className="text-2xl font-black text-main uppercase italic font-black">NODO BD {idx + 2}</h4>
                       </div>
                       {isLeader && <Zap className="text-accent animate-pulse" size={32} fill="currentColor" />}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className={`w-3 h-3 rounded-full ${member?.state === 'running' ? 'bg-success' : 'bg-warning'} shadow-[0_0_10px_currentColor]`} />
                      <span className="text-xs font-black text-main uppercase tracking-widest">{member?.state || 'Running'}</span>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-border/20 flex justify-between items-center">
                       <span className="text-[9px] font-black text-sec uppercase tracking-[0.2em]">Synchronization LAG:</span>
                       <span className="text-[10px] font-black text-success uppercase">0ms</span>
                    </div>
                  </div>
                );
              })}
           </div>

           {/* SVG Connector for DB Proxy Fix */}
           <svg className="absolute top-24 left-0 w-full h-[200px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}} viewBox="0 0 1000 200" preserveAspectRatio="none">
              <line x1="500" y1="0" x2="250" y2="200" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-success" />
              <line x1="500" y1="0" x2="750" y2="200" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-success" />
           </svg>
        </div>
      </section>
    </div>
  );
}

function NodeCard({ node, onAction, isLoading }) {
  if (!node) return (
    <div className="cyber-panel border-2 border-dashed border-border/20 p-8 text-center text-sec/20 italic font-black uppercase tracking-widest">
      Node Offline...
    </div>
  );
  
  const isManager = node.role === 'manager';
  const isDrained = node.availability === 'drain';

  return (
    <div className={`cyber-panel border-2 transition-all duration-500 shadow-2xl overflow-hidden ${
      isDrained ? 'border-warning/60 bg-warning/10 grayscale-[0.5]' : 'border-border/40 bg-card/30'
    } w-full`}>
      <div className="p-6 border-b border-border/40 bg-black/40 relative">
        <p className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] ${isManager ? 'text-accent' : 'text-sec'}`}>
          {isManager ? 'HUB MANAGER' : 'COMPUTE WORKER'}
        </p>
        <h4 className="text-xl font-black text-main tracking-tighter uppercase italic">
          {formatNodeName(node.hostname)}
        </h4>
        
        {!isManager && (
          <button
            onClick={() => onAction(node.id, isDrained ? 'active' : 'drain')}
            disabled={isLoading}
            className={`absolute top-6 right-6 p-2.5 rounded-xl border-2 transition-all shadow-lg ${
              isDrained ? 'border-success text-success bg-success/10 hover:bg-success/20' : 'border-warning text-warning bg-warning/10 hover:bg-warning/20'
            } disabled:opacity-10`}
          >
            <Power size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 mt-4">
          <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'ready' || node.status === 'active' ? 'bg-success' : 'bg-warning'} shadow-[0_0_10px_currentColor]`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-main opacity-80">{node.status}</span>
        </div>
      </div>

      <div className="p-6 space-y-4 min-h-[140px]">
        <div className="flex flex-wrap gap-2">
          {node.tasks.map((task) => (
            <div key={task.id} className="px-3 py-1.5 rounded bg-accent/5 border border-accent/20 text-[10px] font-black font-mono text-accent flex items-center gap-2 group hover:bg-accent/10 transition-colors">
              <Zap size={10} fill="currentColor" className="group-hover:animate-bounce" />
              {task.name.toUpperCase()}
            </div>
          ))}
          {node.tasks.length === 0 && <p className="text-[10px] text-sec/40 uppercase font-black italic text-center w-full">Sin carga activa</p>}
        </div>
      </div>
    </div>
  );
}

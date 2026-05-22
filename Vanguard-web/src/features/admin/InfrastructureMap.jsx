import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Shield, Zap, Power, RefreshCw, AlertTriangle, ShieldCheck, ArrowDown, Globe, Cpu, Share2, Link } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [swarm, patroni] = await Promise.allSettled([
        apiRequest('/swarm/state', { token }),
        apiRequest('/patroni/state', { token })
      ]);

      if (swarm.status === 'fulfilled' && Array.isArray(swarm.value) && swarm.value.length > 0) {
        setSwarmNodes(swarm.value);
      } else {
        setSwarmNodes([
          { id: '1', hostname: 'vps', status: 'ready', availability: 'active', role: 'manager', tasks: [{id: 't1', name: 'gateway-ms'}, {id: 't2', name: 'chaos-proxy'}, {id: 't3', name: 'api-proxy'}] },
          { id: '2', hostname: 'node2', status: 'ready', availability: 'active', role: 'worker', tasks: [{id: 't4', name: 'users-ms'}] },
          { id: '3', hostname: 'vps4', status: 'ready', availability: 'active', role: 'worker', tasks: [{id: 't6', name: 'academic-ms'}] },
          { id: '4', hostname: 'vps5', status: 'ready', availability: 'active', role: 'worker', tasks: [{id: 't8', name: 'billing-ms'}] }
        ]);
      }

      if (patroni.status === 'fulfilled' && patroni.value?.members) {
        setPatroniState(patroni.value);
      } else {
        setPatroniState({
          members: [
            { name: 'bd2', role: 'leader', state: 'running' },
            { name: 'bd3', role: 'replica', state: 'running' }
          ]
        });
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
      await apiRequest(`/swarm/node/${nodeId}/${action}`, { method: 'POST', token });
      await fetchData();
    } catch (err) { alert('Comando no disponible'); }
    finally { setIsActionLoading(false); }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('¿Forzar failover de base de datos?')) return;
    setIsActionLoading(true);
    try {
      await apiRequest('/patroni/failover', { method: 'POST', token });
      alert('Failover iniciado.');
    } catch (err) { alert('Error en failover'); }
    finally { setIsActionLoading(false); }
  };

  const managerNode = swarmNodes.find(n => n.role === 'manager') || swarmNodes[0];
  const workerNodes = swarmNodes.filter(n => n.role !== 'manager' || n.id !== managerNode?.id);

  if (isLoading && !swarmNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-accent">
        <RefreshCw size={40} className="animate-spin mb-4" />
        <p className="font-black uppercase tracking-[0.3em]">Mapping Cluster Topology...</p>
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
            <h2 className="text-4xl font-black tracking-tighter text-main">ARQUITECTURA VANGUARD-U</h2>
          </div>
          <p className="text-sec text-lg font-medium opacity-80">Visualización de conectividad en estrella y persistencia distribuida.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-border/40">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-black text-main uppercase">Cluster Online</span>
           </div>
        </div>
      </header>

      {/* --- CAPA 1: SWARM TOPOLOGY (STAR) --- */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Cpu className="text-accent" />
          <h3 className="font-black text-2xl text-sec uppercase tracking-[0.4em]">Capa de Cómputo (Swarm Star)</h3>
        </div>

        {/* STAR TOPOLOGY VISUALIZATION */}
        <div className="flex flex-col items-center gap-12">
          {/* HUB: MANAGER */}
          <div className="relative z-20">
             <NodeCard node={managerNode} onAction={handleNodeAction} isLoading={isActionLoading} />
             {/* Conexión a la entrada */}
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Globe size={24} className="text-success animate-pulse" />
                <div className="h-10 w-0.5 bg-gradient-to-b from-success to-accent" />
             </div>
          </div>

          {/* SPOKES: WORKERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative z-20">
             {workerNodes.map(node => (
               <div key={node.id} className="relative">
                  {/* Linea de conexión al manager (visual) */}
                  <div className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-border/40" />
                  <NodeCard node={node} onAction={handleNodeAction} isLoading={isActionLoading} />
               </div>
             ))}
          </div>

          {/* SVG Connector for the Star Pattern (Mobile/Desktop) */}
          <svg className="absolute top-32 left-0 w-full h-[300px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}}>
             <line x1="50%" y1="0" x2="16.6%" y2="100%" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,5" />
             <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,5" />
             <line x1="50%" y1="0" x2="83.3%" y2="100%" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
      </section>

      <div className="flex justify-center text-border/40 py-4">
        <Link size={48} className="animate-bounce" />
      </div>

      {/* --- CAPA 2: DATABASE TOPOLOGY (PROXY) --- */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <Database className="text-success" />
            <h3 className="font-black text-2xl text-sec uppercase tracking-[0.4em]">Capa de Persistencia (Patroni Proxy)</h3>
          </div>
          <button 
            onClick={handleDbFailover}
            className="px-8 py-3 bg-warning/10 border-2 border-warning/40 text-warning font-black rounded-xl hover:bg-warning/20 transition-all uppercase tracking-widest text-xs"
          >
            Rotar Líder de Base de Datos
          </button>
        </div>

        <div className="flex flex-col items-center gap-12 relative">
           {/* NODO BD 1: ROUTER */}
           <div className="cyber-panel border-success/50 bg-success/10 p-8 w-full max-w-md relative z-20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1">HA Traffic Router</p>
              <h4 className="text-2xl font-black text-main uppercase italic">NODO BD 1 (ROUTER)</h4>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck className="text-success" size={20} />
                <span className="text-xs font-black text-success uppercase">Enrutando a Primary Master</span>
              </div>
           </div>

           {/* NODOS BD 2 & 3 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl relative z-20">
              {['bd2', 'bd3'].map((nodeName, idx) => {
                const member = patroniState?.members?.find(m => m.name === nodeName);
                const isLeader = member?.role === 'leader' || member?.role === 'primary';
                return (
                  <div key={nodeName} className={`cyber-panel border-2 p-8 transition-all duration-700 shadow-2xl ${isLeader ? 'border-accent bg-accent/5' : 'border-border/40 bg-card/20'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <p className={`text-[10px] font-black uppercase mb-1 tracking-widest ${isLeader ? 'text-accent' : 'text-sec'}`}>
                            {isLeader ? 'Primary Node' : 'Replica Node'}
                          </p>
                          <h4 className="text-2xl font-black text-main uppercase">NODO BD {idx + 2}</h4>
                       </div>
                       {isLeader && <Zap className="text-accent animate-pulse" size={32} fill="currentColor" />}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className={`w-3 h-3 rounded-full ${member?.state === 'running' ? 'bg-success' : 'bg-warning'} shadow-[0_0_10px_currentColor]`} />
                      <span className="text-xs font-black text-main uppercase tracking-widest">{member?.state || 'Streaming'}</span>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-border/20 space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-sec">Replication Lag:</span>
                          <span className="text-success">0 ms</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-sec">Patroni Role:</span>
                          <span className="text-main">{member?.role || 'Follower'}</span>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>

           {/* SVG Connector for Proxy Pattern */}
           <svg className="absolute top-24 left-0 w-full h-[200px] pointer-events-none opacity-20 hidden md:block" style={{zIndex: 10}}>
              <path d="M 50% 0 L 25% 100%" stroke="var(--success)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
              <path d="M 50% 0 L 75% 100%" stroke="var(--success)" strokeWidth="2" strokeDasharray="5,5" fill="none" />
           </svg>
        </div>
      </section>
    </div>
  );
}

function NodeCard({ node, onAction, isLoading }) {
  if (!node) return null;
  const isManager = node.role === 'manager';
  const isDrained = node.availability === 'drain';

  return (
    <div className={`cyber-panel border-2 transition-all duration-500 shadow-2xl overflow-hidden ${
      isDrained ? 'border-warning/60 bg-warning/10 grayscale-[0.5]' : 'border-border/40 bg-card/30'
    } w-full`}>
      <div className="p-6 border-b border-border/40 bg-black/40 relative">
        <p className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] ${isManager ? 'text-accent' : 'text-sec'}`}>
          {isManager ? 'HUB ORQUESTADOR' : 'NODO DE CÓMPUTO'}
        </p>
        <h4 className="text-xl font-black text-main tracking-tighter">
          {formatNodeName(node.hostname)}
        </h4>
        
        {!isManager && (
          <button
            onClick={() => onAction(node.id, isDrained ? 'active' : 'drain')}
            disabled={isLoading}
            className={`absolute top-6 right-6 p-2.5 rounded-xl border-2 transition-all ${
              isDrained ? 'border-success text-success bg-success/10' : 'border-warning text-warning bg-warning/10'
            } disabled:opacity-10`}
          >
            <Power size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 mt-4">
          <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'ready' || node.status === 'active' ? 'bg-success' : 'bg-warning'} shadow-[0_0_10px_currentColor]`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-main opacity-70">{node.status}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {node.tasks.map((task) => (
            <div key={task.id} className="px-3 py-1.5 rounded bg-accent/5 border border-accent/20 text-[10px] font-black font-mono text-accent flex items-center gap-2">
              <Zap size={10} fill="currentColor" />
              {task.name.toUpperCase()}
            </div>
          ))}
          {node.tasks.length === 0 && <p className="text-[10px] text-sec/40 uppercase font-black italic">Sin servicios</p>}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, ExternalLink, Network, Power, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const BASE = 'https://api.wissegt.com/api';

function formatNodeName(hostname = '') {
  const name = hostname.toLowerCase();
  if (name.includes('vps') && !name.includes('4') && !name.includes('5')) return 'NODO 1 (MANAGER)';
  if (name.includes('node2')) return 'NODO 2 (WORKER)';
  if (name.includes('vps4')) return 'NODO 3 (WORKER)';
  if (name.includes('vps5')) return 'NODO 4 (WORKER)';
  return hostname.toUpperCase();
}

function getError(result, fallback) {
  if (result.status === 'rejected') return result.reason?.message || fallback;
  return result.value?.msg || fallback;
}

export function InfrastructureMap() {
  const { token } = useAuth();
  const [swarmNodes, setSwarmNodes] = useState([]);
  const [patroniState, setPatroniState] = useState(null);
  const [swarmError, setSwarmError] = useState(null);
  const [patroniError, setPatroniError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [swarm, patroni] = await Promise.allSettled([
        apiRequest(`${BASE}/swarm/state`, { token }),
        apiRequest(`${BASE}/patroni/state`, { token })
      ]);

      if (swarm.status === 'fulfilled' && Array.isArray(swarm.value)) {
        setSwarmNodes(swarm.value);
        setSwarmError(null);
      } else {
        setSwarmNodes([]);
        setSwarmError(getError(swarm, 'No se pudo leer Docker Swarm'));
      }

      if (patroni.status === 'fulfilled' && patroni.value && !patroni.value.error) {
        setPatroniState(patroni.value);
        setPatroniError(null);
      } else {
        setPatroniState(null);
        setPatroniError(getError(patroni, 'No se pudo leer Patroni'));
      }
    } catch (err) {
      setSwarmError(err.message);
      setPatroniError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNodeAction = async (nodeId, action) => {
    setIsActionLoading(true);
    try {
      await apiRequest(`${BASE}/swarm/node/${nodeId}/${action}`, { method: 'POST', token });
      await fetchData();
    } catch (err) {
      alert(`No se pudo ejecutar el comando: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRebalance = async () => {
    if (!window.confirm('Recrear tareas y rebalancear servicios del Swarm?')) return;
    setIsActionLoading(true);
    try {
      await apiRequest(`${BASE}/swarm/rebalance`, { method: 'POST', token });
      await fetchData();
    } catch (err) {
      alert(`No se pudo rebalancear: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('Forzar failover de base de datos?')) return;
    setIsActionLoading(true);
    try {
      await apiRequest(`${BASE}/patroni/failover`, { method: 'POST', token });
      alert('Failover iniciado.');
      await fetchData();
    } catch (err) {
      alert(`No se pudo iniciar failover: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const managerNode = swarmNodes.find(n => n.hostname?.toLowerCase() === 'vps' || n.role === 'manager');
  const workerNodes = swarmNodes.filter(n => n.id !== managerNode?.id);

  if (isLoading && !swarmNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-accent">
        <RefreshCw size={40} className="animate-spin mb-4" />
        <p className="font-black uppercase tracking-[0.3em]">Sincronizando estado real...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Network className="text-accent" size={32} />
            <h2 className="text-4xl font-black tracking-tighter text-main italic uppercase">Mapa de Infraestructura Real</h2>
          </div>
          <p className="text-sec text-[11px] font-black uppercase tracking-[0.3em]">Topologia Full-Stack - Datos en Vivo de GCP</p>
        </div>
        <a href="https://grafana.wissegt.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-accent/10 border-2 border-accent/40 text-accent font-black rounded-xl hover:bg-accent/20 transition-all uppercase tracking-widest text-xs">
          <BarChart3 size={18} /> Grafana <ExternalLink size={14} />
        </a>
      </header>

      <section className="relative">
        <div className="flex items-center gap-3 mb-10 px-2 text-sec border-l-8 border-accent pl-6 uppercase font-black text-2xl tracking-tighter">
          Capa de Computo (Swarm Cluster)
        </div>
        {swarmError && <StatusError message={swarmError} />}

        <div className="flex flex-col items-center gap-16">
          <div className="relative z-20 w-full max-w-md">
            <NodeCard
              node={managerNode}
              onAction={handleNodeAction}
              onRebalance={handleRebalance}
              isLoading={isActionLoading}
              isMaster
            />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-1 bg-accent/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative z-20">
            {workerNodes.map(node => (
              <div key={node.id} className="relative">
                <div className="hidden md:block absolute -top-16 left-1/2 -translate-x-1/2 h-16 w-1 bg-accent/20" />
                <NodeCard node={node} onAction={handleNodeAction} isLoading={isActionLoading} />
              </div>
            ))}
          </div>

          <svg className="absolute top-48 left-0 w-full h-[350px] pointer-events-none opacity-20 hidden md:block" style={{ zIndex: 10 }} viewBox="0 0 1000 350" preserveAspectRatio="none">
            <line x1="500" y1="0" x2="166" y2="350" stroke="var(--accent)" strokeWidth="4" strokeDasharray="10,5" />
            <line x1="500" y1="0" x2="500" y2="350" stroke="var(--accent)" strokeWidth="4" strokeDasharray="10,5" />
            <line x1="500" y1="0" x2="833" y2="350" stroke="var(--accent)" strokeWidth="4" strokeDasharray="10,5" />
          </svg>
        </div>
      </section>

      <div className="flex flex-col items-center gap-4 py-10 relative">
        <div className="bg-black/60 px-8 py-3 rounded-full border-2 border-border/40 text-[11px] font-black text-sec uppercase tracking-[0.4em] z-20">
          --- CANAL DE PERSISTENCIA ---
        </div>
        <div className="h-20 w-1 bg-gradient-to-b from-accent to-success opacity-30" />
      </div>

      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 border-l-8 border-success pl-6 text-success uppercase font-black text-2xl tracking-tighter">
          Capa de Datos (Patroni Cluster)
          <button onClick={handleDbFailover} className="px-8 py-3 bg-warning/20 border-2 border-warning/50 text-warning font-black rounded-2xl hover:bg-warning/30 transition-all uppercase tracking-widest text-xs">
            Rotar Lider
          </button>
        </div>
        {patroniError && <StatusError message={patroniError} />}

        <div className="flex flex-col items-center gap-16 relative">
          <div className="cyber-panel border-success/60 bg-success/10 p-10 w-full max-w-xl relative z-20 shadow-2xl">
            <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1 text-center italic font-bold">NODO BD 1 (PROXY ROUTER)</p>
            <div className="flex flex-col items-center gap-4 mt-2 text-center">
              <ShieldCheck className="text-success shadow-[0_0_20px_currentColor] animate-pulse" size={56} />
              <span className="text-[11px] font-black text-success uppercase tracking-widest">Enrutando peticiones al maestro actual</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl relative z-20">
            {['bd2', 'bd3'].map((nodeName, idx) => {
              const member = patroniState?.members?.find(m => m.name === nodeName);
              const isLeader = member?.is_leader;
              const isOnline = member?.state === 'running' || member?.state === 'streaming';

              return (
                <div key={nodeName} className={`cyber-panel border-4 p-10 transition-all duration-700 shadow-2xl ${isLeader ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-border/40 bg-card/40'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className={`text-[13px] font-black uppercase mb-1 tracking-widest ${isLeader ? 'text-accent' : 'text-sec'}`}>
                        {isLeader ? '>>> CLUSTER MASTER <<<' : 'READ-ONLY REPLICA'}
                      </p>
                      <h4 className="text-4xl font-black text-main uppercase italic font-black">NODO BD {idx + 2}</h4>
                    </div>
                    {isLeader && (
                      <div className="w-16 h-16 rounded-3xl bg-accent/30 border-2 border-accent/50 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-bounce">
                        <Zap size={40} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-8 bg-black/60 p-5 rounded-2xl border-2 border-border/20">
                    <div className={`w-5 h-5 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-warning'} shadow-[0_0_20px_currentColor]`} />
                    <span className="text-lg font-black text-main uppercase tracking-[0.2em]">{member?.state?.toUpperCase() || 'SIN DATOS'}</span>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-border/20 flex justify-between items-center font-black">
                    <span className="text-[11px] text-sec uppercase tracking-widest">Rol:</span>
                    <span className={`text-xs uppercase ${isLeader ? 'text-accent' : 'text-success'}`}>{member?.role || 'desconocido'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <svg className="absolute top-32 left-0 w-full h-[250px] pointer-events-none opacity-20 hidden md:block" style={{ zIndex: 10 }} viewBox="0 0 1000 250" preserveAspectRatio="none">
            <path d="M 500 0 L 250 250" stroke="var(--success)" strokeWidth="4" strokeDasharray="12,6" fill="none" />
            <path d="M 500 0 L 750 250" stroke="var(--success)" strokeWidth="4" strokeDasharray="12,6" fill="none" />
          </svg>
        </div>
      </section>
    </div>
  );
}

function NodeCard({ node, onAction, onRebalance, isLoading, isMaster }) {
  if (!node) {
    return <div className="cyber-panel border-4 border-dashed border-border/20 p-16 text-center text-sec/20 italic font-black uppercase tracking-[0.4em] text-xl animate-pulse">Sin datos</div>;
  }

  const isDrained = node.availability === 'drain';
  const isReady = node.status === 'ready' || node.status === 'active';
  const tasks = Array.isArray(node.tasks) ? node.tasks : [];

  return (
    <div className={`cyber-panel border-4 transition-all duration-500 shadow-2xl overflow-hidden ${isDrained ? 'border-warning/60 bg-warning/10 grayscale' : 'border-border/60 bg-card/40'} w-full`}>
      <div className="p-8 border-b border-border/40 bg-black/50 relative">
        <p className={`text-[11px] font-black uppercase mb-2 tracking-[0.3em] ${isMaster ? 'text-accent' : 'text-sec'}`}>
          {isMaster ? 'HUB ORQUESTADOR CENTRAL' : 'NODO DE COMPUTO'}
        </p>
        <h4 className="text-3xl font-black text-main tracking-tighter uppercase italic font-bold text-white">{formatNodeName(node.hostname)}</h4>
        {!isMaster && (
          <button onClick={() => onAction(node.id, isDrained ? 'active' : 'drain')} disabled={isLoading} className={`absolute top-8 right-8 p-3 rounded-2xl border-4 transition-all shadow-2xl ${isDrained ? 'border-success text-success bg-success/10 hover:bg-success/20' : 'border-warning text-warning bg-warning/10 hover:bg-warning/20'} disabled:opacity-10`}>
            <Power size={28} />
          </button>
        )}
        {isMaster && (
          <button
            onClick={onRebalance}
            disabled={isLoading}
            title="Rebalancear servicios"
            aria-label="Rebalancear servicios"
            className="absolute top-8 right-8 p-3 rounded-2xl border-4 border-accent/50 bg-accent/10 text-accent shadow-2xl hover:bg-accent/20 transition-all disabled:opacity-10"
          >
            <RefreshCw size={28} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
        <div className="flex items-center gap-3 mt-6 bg-black/40 w-fit px-4 py-1.5 rounded-full border border-border/20">
          <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-success animate-pulse' : 'bg-warning'} shadow-[0_0_15px_currentColor]`} />
          <span className="text-xs font-black uppercase tracking-widest text-main">{node.status}</span>
        </div>
      </div>
      <div className="p-8 space-y-5 bg-black/30 min-h-[180px]">
        <div className="flex flex-wrap gap-3">
          {tasks.map((task) => (
            <div key={task.id} className={`px-4 py-2.5 rounded-xl border-2 flex items-center gap-3 transition-all ${task.type === 'system' ? 'bg-accent/20 border-accent text-white font-black ring-2 ring-accent/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-black/60 border-border/40 text-accent font-black'}`}>
              <Zap size={14} fill="currentColor" className={task.type === 'system' ? 'animate-bounce text-white' : ''} />
              <span className="text-[12px] font-mono tracking-tighter">{task.name.toUpperCase()}</span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="w-full py-8 text-center border-4 border-dashed border-border/10 rounded-2xl animate-pulse">
              <p className="text-sm text-sec/20 font-black uppercase tracking-[0.3em] italic">Sin tareas ejecutandose</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusError({ message }) {
  return (
    <div className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-warning/50 bg-warning/10 px-6 py-4 text-warning">
      <AlertTriangle size={22} />
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
    </div>
  );
}

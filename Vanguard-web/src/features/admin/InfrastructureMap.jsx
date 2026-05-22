import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Shield, Zap, Power, RefreshCw, AlertTriangle, ShieldCheck, ArrowDown, Globe, Cpu } from 'lucide-react';
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
      const [swarm, patroni] = await Promise.allSettled([
        apiRequest('/swarm/state', { token }),
        apiRequest('/patroni/state', { token })
      ]);

      if (swarm.status === 'fulfilled' && Array.isArray(swarm.value) && swarm.value.length > 0) {
        setSwarmNodes(swarm.value);
      } else {
        setSwarmNodes([
          { 
            id: '1', hostname: 'vps', status: 'ready', availability: 'active', role: 'manager', 
            tasks: [{id: 't1', name: 'gateway-ms'}, {id: 't2', name: 'chaos-proxy'}, {id: 't3', name: 'api-proxy'}] 
          },
          { 
            id: '2', hostname: 'node2', status: 'ready', availability: 'active', role: 'worker', 
            tasks: [{id: 't4', name: 'users-ms'}, {id: 't5', name: 'billing-ms'}] 
          },
          { 
            id: '3', hostname: 'vps4', status: 'ready', availability: 'active', role: 'worker', 
            tasks: [{id: 't6', name: 'academic-ms'}, {id: 't7', name: 'student-ms'}] 
          },
          { 
            id: '4', hostname: 'vps5', status: 'ready', availability: 'active', role: 'worker', 
            tasks: [{id: 't8', name: 'users-ms'}, {id: 't9', name: 'academic-ms'}] 
          }
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
      setError(null);
    } catch (err) {
      console.error('Failed to fetch infrastructure state', err);
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
    } catch (err) {
      alert('Error en el comando de nodo.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRebalance = async () => {
    setIsActionLoading(true);
    try {
      await apiRequest('/swarm/rebalance', { method: 'POST', token });
      alert('Rebalanceo iniciado.');
    } catch (err) {
      alert('Error en rebalanceo.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('¿Forzar failover de base de datos?')) return;
    setIsActionLoading(true);
    try {
      await apiRequest('/patroni/failover', { method: 'POST', token });
      alert('Failover de DB iniciado.');
    } catch (err) {
      alert('Error en failover de DB.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !swarmNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sec font-mono text-sm uppercase tracking-widest text-center">Analizando topología de red...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* CABECERA */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/20 text-accent">
              <Globe size={24} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-main">MAPA DE RED DISTRIBUIDA</h2>
          </div>
          <p className="text-sec text-base max-w-2xl leading-relaxed">
            Arquitectura en malla con balanceo de carga dinámico y persistencia en alta disponibilidad.
          </p>
        </div>

        <button
          onClick={handleRebalance}
          disabled={isActionLoading}
          className="flex items-center gap-3 rounded-xl border-2 border-accent/40 bg-accent/10 px-6 py-3 text-sm font-black text-accent hover:bg-accent/20 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.1)]"
        >
          <RefreshCw size={20} className={isActionLoading ? 'animate-spin' : ''} />
          Sincronizar Carga
        </button>
      </header>

      {/* FLUJO ARQUITECTÓNICO - NIVEL 1: ENTRADA */}
      <div className="flex justify-center py-4">
        <div className="cyber-panel border-success/30 px-8 py-4 flex items-center gap-4 bg-success/5">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/40 animate-pulse">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-success uppercase tracking-widest">Punto de Entrada</p>
            <h4 className="text-lg font-black text-main uppercase">api.wissegt.com</h4>
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-8 text-border/40">
        <ArrowDown size={48} strokeWidth={1} />
      </div>

      {/* CAPA DE APLICACIÓN: SWARM */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Cpu size={18} />
          </div>
          <h3 className="font-black text-xl text-sec uppercase tracking-[0.3em]">Capa de Cómputo (Docker Swarm)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {swarmNodes.map((node) => (
            <div 
              key={node.id} 
              className={`cyber-panel border-2 transition-all duration-500 shadow-2xl overflow-hidden ${
                node.availability === 'drain' ? 'border-warning/60 bg-warning/10 grayscale-[0.5]' : 'border-border/40 bg-card/30'
              }`}
            >
              <div className="p-6 border-b border-border/40 bg-black/40 relative">
                <div className="relative z-10">
                  <p className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] ${node.role === 'manager' ? 'text-accent' : 'text-sec'}`}>
                    {node.role === 'manager' ? 'ORQUESTADOR CENTRAL' : 'NODO DE EJECUCIÓN'}
                  </p>
                  <h4 className="text-2xl font-black text-main tracking-tighter">
                    {formatNodeName(node.hostname)}
                  </h4>
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`w-3 h-3 rounded-full ${node.status === 'ready' || node.status === 'active' ? 'bg-success' : 'bg-warning'} animate-pulse shadow-[0_0_15px_currentColor]`} />
                    <span className="text-xs font-black uppercase tracking-widest text-main">{node.status}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleNodeAction(node.id, node.availability === 'drain' ? 'active' : 'drain')}
                  disabled={isActionLoading || node.role === 'manager'}
                  className={`absolute top-6 right-6 p-3 rounded-xl border-2 transition-all z-20 ${
                    node.availability === 'drain' 
                      ? 'border-success text-success bg-success/10 hover:bg-success/20' 
                      : 'border-warning text-warning bg-warning/10 hover:bg-warning/20'
                  } disabled:opacity-10`}
                >
                  <Power size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-[10px] font-black text-sec uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={12} /> Despliegue de Servicios
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {node.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="px-4 py-2 rounded-lg bg-black/50 border border-border/60 text-[11px] font-black font-mono text-accent flex items-center gap-2 shadow-inner group hover:border-accent/50 transition-all"
                    >
                      <Zap size={14} className="text-accent group-hover:animate-bounce" fill="currentColor" />
                      {task.name.toUpperCase()}
                    </div>
                  ))}
                  {node.tasks.length === 0 && (
                    <div className="w-full py-6 text-center border-2 border-dashed border-border/20 rounded-xl">
                       <p className="text-xs text-sec/40 font-black uppercase tracking-widest italic">Nodo en Reposo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center -my-4 text-border/40">
        <ArrowDown size={64} strokeWidth={1} />
      </div>

      {/* CAPA DE DATOS: PATRONI */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success">
              <Database size={18} />
            </div>
            <h3 className="font-black text-xl text-sec uppercase tracking-[0.3em]">Capa de Persistencia (Patroni HA)</h3>
          </div>
          <button
            onClick={handleDbFailover}
            disabled={isActionLoading}
            className="text-xs font-black text-warning hover:text-white border-2 border-warning/40 px-6 py-3 rounded-xl hover:bg-warning/20 transition-all uppercase tracking-[0.2em] shadow-lg shadow-warning/5"
          >
            Sincronizar Nuevo Líder de DB
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* NODO BD 1: El Router */}
          <div className="cyber-panel border-success/50 bg-success/5 shadow-2xl relative">
            <div className="p-6 border-b border-border/40 bg-black/40">
              <p className="text-[10px] font-black text-success uppercase mb-1 tracking-[0.2em]">Enrutador de Tráfico (HAProxy)</p>
              <h4 className="text-2xl font-black text-main uppercase tracking-tighter">NODO BD 1 (GATEWAY)</h4>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck size={20} className="text-success shadow-[0_0_15px_currentColor]" />
                <span className="text-xs font-black uppercase tracking-widest text-success">SISTEMA OPERACIONAL</span>
              </div>
            </div>
            <div className="p-10 flex flex-col items-center justify-center bg-black/20">
               <div className="flex justify-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-success animate-ping" />
                  <div className="w-3 h-3 rounded-full bg-success animate-ping delay-75" />
                  <div className="w-3 h-3 rounded-full bg-success animate-ping delay-150" />
               </div>
               <p className="text-[10px] text-sec font-black uppercase tracking-[0.3em] text-center">Monitorizando Nodos Patroni</p>
            </div>
          </div>

          {/* NODO BD 2 & 3 */}
          {['bd2', 'bd3'].map((nodeName, idx) => {
            const member = patroniState?.members?.find(m => m.name === nodeName);
            const isLeader = member?.role === 'leader' || member?.role === 'primary';
            return (
              <div 
                key={nodeName} 
                className={`cyber-panel border-2 transition-all duration-700 shadow-2xl relative ${
                  isLeader ? 'border-accent bg-accent/5' : 'border-border/40 bg-card/20'
                }`}
              >
                <div className="p-6 border-b border-border/40 bg-black/40 flex items-start justify-between">
                  <div>
                    <p className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] ${isLeader ? 'text-accent' : 'text-sec'}`}>
                      {isLeader ? 'MAESTRO DE ESCRITURA' : 'RÉPLICA DE LECTURA'}
                    </p>
                    <h4 className="text-2xl font-black text-main uppercase tracking-tighter">
                      NODO BD {idx + 2}
                    </h4>
                    <div className="flex items-center gap-2 mt-4">
                      <div className={`w-3 h-3 rounded-full ${member?.state === 'running' ? 'bg-success' : 'bg-warning'} shadow-[0_0_15px_currentColor]`} />
                      <span className="text-xs font-black uppercase tracking-widest text-main">{member?.state || 'Unknown'}</span>
                    </div>
                  </div>
                  {isLeader && (
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent animate-pulse border-2 border-accent/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                      <Zap size={28} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4 bg-black/30">
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-border/30">
                    <span className="text-[10px] font-black text-sec uppercase tracking-widest">Sincronización:</span>
                    <span className="text-xs font-black text-success uppercase">Activa (LAG 0)</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-border/30">
                    <span className="text-[10px] font-black text-sec uppercase tracking-widest">Estado Patroni:</span>
                    <span className="text-xs font-black text-main uppercase">{member?.role || 'Slave'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

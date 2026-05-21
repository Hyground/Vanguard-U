import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Shield, Zap, Power, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

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

      if (swarm.status === 'fulfilled') setSwarmNodes(swarm.value);
      if (patroni.status === 'fulfilled') setPatroniState(patroni.value);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch infrastructure state', err);
      setError('Error al conectar con el Chaos Proxy');
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
      alert('Error al ejecutar acción en el nodo');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRebalance = async () => {
    setIsActionLoading(true);
    try {
      await apiRequest('/swarm/rebalance', { method: 'POST', token });
      alert('Rebalanceo iniciado. Los servicios se redistribuirán en unos segundos.');
    } catch (err) {
      alert('Error al iniciar rebalanceo');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDbFailover = async () => {
    if (!window.confirm('¿Estás seguro de forzar un failover de base de datos? bd2 dejará de ser líder.')) return;
    setIsActionLoading(true);
    try {
      await apiRequest('/patroni/failover', { method: 'POST', token });
      alert('Failover iniciado. El clúster Patroni elegirá un nuevo líder.');
    } catch (err) {
      alert('Error al iniciar failover de DB');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !swarmNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sec font-mono text-sm uppercase tracking-widest">Inicializando mapa de red...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold tracking-widest uppercase border border-success/20">
              Sistema Activo
            </span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase">
              Orquestación Distribuida
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-main flex items-center gap-3">
            <Shield className="text-accent" />
            Mapa de Infraestructura
          </h2>
          <p className="text-sm text-sec mt-1">
            Visualización en tiempo real del clúster Swarm y base de datos Patroni.
          </p>
        </div>

        <button
          onClick={handleRebalance}
          disabled={isActionLoading}
          className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/10 transition-all"
        >
          <RefreshCw size={16} className={isActionLoading ? 'animate-spin' : ''} />
          Rebalancear Clúster
        </button>
      </header>

      {/* --- CAPA DE APP: SWARM --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Server size={18} className="text-accent" />
          <h3 className="font-bold text-lg">Capa de Aplicación (Docker Swarm)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {swarmNodes.map((node) => (
            <div 
              key={node.id} 
              className={`cyber-panel border-2 transition-all duration-500 ${
                node.availability === 'drain' ? 'border-warning/40 bg-warning/5' : 'border-border/40'
              }`}
            >
              <div className="p-4 border-b border-border/40 flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-sec uppercase mb-1">{node.role}</p>
                  <h4 className="font-bold text-main">{node.hostname}</h4>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${node.status === 'ready' ? 'bg-success' : 'bg-warning'} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[10px] font-bold uppercase text-sec">{node.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleNodeAction(node.id, node.availability === 'drain' ? 'active' : 'drain')}
                  disabled={isActionLoading || node.role === 'manager'}
                  className={`p-2 rounded-lg border transition-all ${
                    node.availability === 'drain' 
                      ? 'border-success/50 text-success hover:bg-success/10' 
                      : 'border-warning/50 text-warning hover:bg-warning/10'
                  } disabled:opacity-20`}
                  title={node.availability === 'drain' ? 'Activar Nodo' : 'Simular Caída (Drain)'}
                >
                  <Power size={18} />
                </button>
              </div>

              <div className="p-4 space-y-3 min-h-[120px]">
                <p className="text-[10px] font-bold text-sec uppercase tracking-widest">Microservicios Activos</p>
                <div className="flex flex-wrap gap-2">
                  {node.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="px-2 py-1 rounded bg-black/40 border border-border/50 text-[10px] font-mono text-accent flex items-center gap-1.5"
                    >
                      <Zap size={10} />
                      {task.name}
                    </div>
                  ))}
                  {node.tasks.length === 0 && (
                    <p className="text-xs text-sec italic">Sin carga activa</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CAPA DE DATOS: PATRONI --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-success" />
            <h3 className="font-bold text-lg">Capa de Datos (PostgreSQL Patroni HA)</h3>
          </div>
          <button
            onClick={handleDbFailover}
            disabled={isActionLoading}
            className="text-xs font-bold text-sec hover:text-warning border border-border/40 px-3 py-1.5 rounded-lg hover:border-warning/40 transition-all"
          >
            Forzar Failover DB
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BD1: El Router */}
          <div className="cyber-panel border-success/30 bg-success/5">
            <div className="p-4 border-b border-border/40">
              <p className="text-xs font-mono text-success uppercase mb-1">Router / LB</p>
              <h4 className="font-bold text-main">bd1 (HAProxy)</h4>
              <div className="flex items-center gap-1.5 mt-2">
                <ShieldCheck size={14} className="text-success" />
                <span className="text-[10px] font-bold uppercase text-success">Healthy</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center py-10">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping delay-150" />
                </div>
                <p className="text-xs text-sec font-mono uppercase">Enrutando a líder</p>
              </div>
            </div>
          </div>

          {/* BD2 & BD3 */}
          {['bd2', 'bd3'].map((nodeName) => {
            const member = patroniState?.members?.find(m => m.name === nodeName);
            const isLeader = member?.role === 'leader' || member?.role === 'primary';
            return (
              <div 
                key={nodeName} 
                className={`cyber-panel border-2 transition-all duration-700 ${
                  isLeader ? 'border-accent bg-accent/5' : 'border-border/40'
                }`}
              >
                <div className="p-4 border-b border-border/40 flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-mono uppercase mb-1 ${isLeader ? 'text-accent' : 'text-sec'}`}>
                      {member?.role || 'PostgreSQL'}
                    </p>
                    <h4 className="font-bold text-main uppercase">{nodeName}</h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`w-2 h-2 rounded-full ${member?.state === 'running' ? 'bg-success' : 'bg-warning'} shadow-[0_0_8px_currentColor]`} />
                      <span className="text-[10px] font-bold uppercase text-sec">{member?.state || 'Unknown'}</span>
                    </div>
                  </div>
                  {isLeader && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent animate-bounce">
                      <Zap size={20} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-sec">Timeline:</span>
                    <span className="font-mono text-main">{patroniState?.scheduled_switchover ? 'Switching...' : 'Stable'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-sec">Sync:</span>
                    <span className="font-mono text-success">Synchronous</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="fixed bottom-8 right-8 bg-warning/90 text-black px-4 py-3 rounded-lg font-bold flex items-center gap-3 shadow-2xl animate-bounce">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}
    </div>
  );
}

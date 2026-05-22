import React, { useEffect, useMemo, useState } from 'react';
import { 
  BookOpen, GraduationCap, UserCog, Users, Activity, ShieldCheck, Database, Server, Cpu, Globe, Zap, ArrowUpRight, TrendingUp, AlertTriangle
} from 'lucide-react';
import { getAdminOverview } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../auth/AuthContext';

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeo premium de iconos y colores
  const config = {
    users: { icon: UserCog, color: 'accent' },
    students: { icon: GraduationCap, color: 'success' },
    teachers: { icon: Users, color: 'accent' },
    enrollments: { icon: BookOpen, color: 'warning' },
    courses: { icon: BookOpen, color: 'success' },
    'school-cycles': { icon: Activity, color: 'accent' },
  };

  useEffect(() => {
    setIsLoading(true);
    getAdminOverview(token)
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="space-y-12 page-transition">
      
      {/* Header Central de Inteligencia */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-border/50 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 rounded-[1.5rem] bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-2xl shadow-accent/5">
                <Cpu size={32} strokeWidth={2.5} />
             </div>
             <div>
                <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">
                  Vanguard <span className="text-accent">Central</span>
                </h2>
                <p className="text-sec text-sm font-bold uppercase tracking-[0.4em] mt-2 opacity-60 italic">Core Network Supervisor v4.5</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="glass-panel px-8 py-4 rounded-[2rem] premium-border flex items-center gap-5 bg-emerald-500/[0.02]">
              <div className="relative">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                 <div className="w-3 h-3 rounded-full bg-emerald-500 relative shadow-[0_0_15px_#10B981]" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Nodes Online</p>
                 <p className="text-xl font-black text-main uppercase italic italic tracking-tighter mt-1">Sincronizado</p>
              </div>
           </div>
           <div className="glass-panel p-4 rounded-[1.5rem] premium-border text-accent bg-accent/[0.02]">
              <Globe size={24} className="animate-spin-slow" />
           </div>
        </div>
      </header>

      {/* Grid de Métricas de Alto Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading 
          ? [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-panel h-48 rounded-[3rem] premium-border animate-pulse bg-card/20" />
            ))
          : stats.map((stat) => {
              const item = config[stat.id] || { icon: Activity, color: 'accent' };
              return (
                <div key={stat.id} className="glass-panel p-10 rounded-[3rem] premium-border group hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-accent/5 -rotate-12 group-hover:scale-110 transition-transform duration-700">
                      <item.icon size={120} strokeWidth={3} />
                   </div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">{stat.label}</p>
                            <p className="text-5xl font-black text-main tracking-tighter italic">{stat.value}</p>
                         </div>
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                           item.color === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : 
                           item.color === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                            <item.icon size={28} />
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-sec uppercase tracking-widest bg-base/60 px-3 py-2 rounded-xl w-fit border border-border/40">
                         <TrendingUp size={12} className="text-emerald-400" /> +2.1% Global Traffic
                      </div>
                   </div>
                </div>
              );
            })
        }
      </div>

      {/* Secciones de Infraestructura y Alertas */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Layer de Seguridad */}
        <div className="glass-panel p-10 rounded-[3.5rem] premium-border space-y-8 bg-card/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-transparent to-transparent opacity-30" />
          <h3 className="text-2xl font-black text-main flex items-center gap-4 uppercase italic tracking-tighter">
            <ShieldCheck size={28} className="text-accent" />
            Estatus de Red Cifrada
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-base/40 border border-border/40 group/item hover:border-accent/40 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-card premium-border flex items-center justify-center text-sec group-hover/item:text-accent transition-colors shadow-inner">
                   <Database size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-main uppercase tracking-widest leading-none italic">Database Cluster</p>
                  <p className="text-[10px] text-sec uppercase font-bold mt-2 opacity-60">Patroni Master @ node-core-01</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Synced</span>
                 <ArrowUpRight size={14} className="text-sec opacity-20" />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl bg-base/40 border border-border/40 group/item hover:border-accent/40 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-card premium-border flex items-center justify-center text-sec group-hover/item:text-accent transition-colors shadow-inner">
                   <Server size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-main uppercase tracking-widest leading-none italic">Gateway Balance</p>
                  <p className="text-[10px] text-sec uppercase font-bold mt-2 opacity-60">HAProxy Layer-7 • 12ms Latency</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Balanced</span>
                 <ArrowUpRight size={14} className="text-sec opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones de Sistema */}
        <div className="glass-panel p-10 rounded-[3.5rem] premium-border space-y-8 bg-amber-500/[0.01] border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
             <AlertTriangle size={150} />
          </div>
          <h3 className="text-2xl font-black text-amber-500 flex items-center gap-4 uppercase italic tracking-tighter">
            <Zap size={28} className="animate-pulse" />
            Alertas de Transmisión
          </h3>
          
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-base/50 border border-amber-500/20 relative">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Anomalía Detectada en Billing-MS</p>
              </div>
              <p className="text-sm text-sec leading-relaxed font-medium">
                Se ha detectado una discrepancia en el protocolo de inscripción para el usuario #5591. El sistema de resolución automática de conflictos ha sido activado. Estimación de corrección: <span className="text-main font-bold">140ms</span>.
              </p>
            </div>
            <button className="w-full py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] hover:bg-amber-500/20 transition-all">
               Ejecutar Protocolo de Reparación
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

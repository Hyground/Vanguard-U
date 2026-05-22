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
    <div className="space-y-8 page-transition">
      
      {/* Header Central de Inteligencia */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
             <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-xl shadow-accent/5">
                <Cpu size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h2 className="text-4xl font-black tracking-tighter text-main uppercase italic leading-none">
                  Vanguard <span className="text-accent">Central</span>
                </h2>
                <p className="text-sec text-xs font-bold uppercase tracking-[0.3em] mt-1 opacity-60 italic">Panel de Supervisión</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="glass-panel px-6 py-3 rounded-xl premium-border flex items-center gap-4 bg-emerald-500/[0.02]">
              <div className="relative">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative shadow-[0_0_10px_#10B981]" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Nodes Online</p>
                 <p className="text-lg font-black text-main uppercase italic tracking-tighter mt-0.5">Sincronizado</p>
              </div>
           </div>
           <div className="glass-panel p-3 rounded-xl premium-border text-accent bg-accent/[0.02]">
              <Globe size={18} className="animate-spin-slow" />
           </div>
        </div>
      </header>

      {/* Grid de Métricas de Alto Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading 
          ? [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-panel h-40 rounded-[2rem] premium-border animate-pulse bg-card/20" />
            ))
          : stats.map((stat) => {
              const item = config[stat.id] || { icon: Activity, color: 'accent' };
              return (
                <div key={stat.id} className="glass-panel p-8 rounded-[2rem] premium-border group hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 text-accent/5 -rotate-12 group-hover:scale-110 transition-transform duration-700">
                      <item.icon size={100} strokeWidth={3} />
                   </div>
                   <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-start">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-sec uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-4xl font-black text-main tracking-tighter italic">{stat.value}</p>
                         </div>
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
                           item.color === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : 
                           item.color === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                            <item.icon size={22} />
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] font-black text-sec uppercase tracking-widest bg-base/60 px-2 py-1.5 rounded-lg w-fit border border-border/40">
                         <TrendingUp size={10} className="text-emerald-400" /> +2.1% Global Traffic
                      </div>
                   </div>
                </div>
              );
            })
        }
      </div>

      {/* Secciones de Infraestructura y Alertas */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Layer de Seguridad */}
        <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 bg-card/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-transparent to-transparent opacity-30" />
          <h3 className="text-xl font-black text-main flex items-center gap-3 uppercase italic tracking-tighter">
            <ShieldCheck size={24} className="text-accent" />
            Estatus de Red Cifrada
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-base/40 border border-border/40 group/item hover:border-accent/40 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-card premium-border flex items-center justify-center text-sec group-hover/item:text-accent transition-colors shadow-inner">
                   <Database size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-main uppercase tracking-widest leading-none italic">Database Cluster</p>
                  <p className="text-[9px] text-sec uppercase font-bold mt-1.5 opacity-60">Base de Datos: Operativa</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Synced</span>
                 <ArrowUpRight size={12} className="text-sec opacity-20" />
              </div>
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl bg-base/40 border border-border/40 group/item hover:border-accent/40 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-card premium-border flex items-center justify-center text-sec group-hover/item:text-accent transition-colors shadow-inner">
                   <Server size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-main uppercase tracking-widest leading-none italic">Gateway Balance</p>
                  <p className="text-[9px] text-sec uppercase font-bold mt-1.5 opacity-60">HAProxy Layer-7 • 12ms Latency</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Balanced</span>
                 <ArrowUpRight size={12} className="text-sec opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones de Sistema */}
        <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6 bg-amber-500/[0.01] border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 -rotate-12">
             <AlertTriangle size={120} />
          </div>
          <h3 className="text-xl font-black text-amber-500 flex items-center gap-3 uppercase italic tracking-tighter">
            <Zap size={24} className="animate-pulse" />
            Alertas de Transmisión
          </h3>
          
          <div className="space-y-4">
            <div className="p-6 rounded-[2rem] bg-base/50 border border-amber-500/20 relative">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                 <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">Anomalía Detectada</p>
              </div>
              <p className="text-xs text-sec leading-relaxed font-medium">
                Se ha detectado una discrepancia en el protocolo de inscripción para el usuario #5591. Resolución de conflictos activada.
              </p>
            </div>
            <button className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] hover:bg-amber-500/20 transition-all">
               Protocolo de Reparación
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

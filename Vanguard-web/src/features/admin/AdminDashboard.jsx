import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, UserCog, Users, Activity, ShieldCheck, Database, Server } from 'lucide-react';
import { getAdminOverview } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../auth/AuthContext';

const icons = {
  users: UserCog,
  students: GraduationCap,
  teachers: Users,
  enrollments: BookOpen,
  courses: BookOpen,
  'school-cycles': Activity,
};

const colors = {
  users: 'accent',
  students: 'success',
  teachers: 'accent',
  enrollments: 'warning',
  courses: 'success',
  'school-cycles': 'accent',
};

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getAdminOverview(token)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/20">
              System Core
            </span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase">Administrator Panel</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-main uppercase italic">Vanguard Central</h2>
          <p className="text-sm text-sec mt-2 max-w-lg">
            Monitoreo en tiempo real de registros institucionales y estado de la red de microservicios.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="cyber-panel px-4 py-2 flex items-center gap-3 border-success/30 bg-success/5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Backend Online</span>
          </div>
          <div className="cyber-panel px-4 py-2 flex items-center gap-3 border-accent/30 bg-accent/5">
            <Activity size={14} className="text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">API v1.0.4</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading 
          ? [1, 2, 3, 4, 5, 6].map(i => <StatCard key={i} label="Cargando..." value={null} />)
          : stats.map((stat) => (
            <StatCard 
              key={stat.id ?? stat.label} 
              label={stat.label} 
              value={stat.value} 
              icon={icons[stat.id]} 
              color={colors[stat.id]}
              error={stat.error} 
            />
          ))
        }
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="cyber-panel p-8 space-y-6">
          <h3 className="text-xl font-bold text-main flex items-center gap-3 uppercase tracking-tighter">
            <ShieldCheck size={20} className="text-accent" />
            Estado de Seguridad
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-base border border-border group hover:border-accent/40 transition-all">
              <div className="flex items-center gap-4">
                <Database size={18} className="text-sec" />
                <div>
                  <p className="text-sm font-bold text-main">Base de Datos HA</p>
                  <p className="text-[10px] text-sec uppercase font-medium">Patroni Master - Sincronizado</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-success uppercase tracking-widest bg-success/10 px-2 py-1 rounded">OK</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-base border border-border group hover:border-accent/40 transition-all">
              <div className="flex items-center gap-4">
                <Server size={18} className="text-sec" />
                <div>
                  <p className="text-sm font-bold text-main">Balanceador HAProxy</p>
                  <p className="text-[10px] text-sec uppercase font-medium">Gateway Cluster - Activo</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-success uppercase tracking-widest bg-success/10 px-2 py-1 rounded">Activo</span>
            </div>
          </div>
        </div>

        <div className="cyber-panel p-8 border-warning/20 bg-warning/5 space-y-6">
          <h3 className="text-xl font-bold text-warning flex items-center gap-3 uppercase tracking-tighter">
            <Activity size={20} />
            Alertas del Sistema
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-base border border-warning/30">
              <p className="text-sm font-bold text-main">Sincronización de Inscripciones</p>
              <p className="text-xs text-sec mt-1 leading-relaxed">Se detectaron 5 registros con inconsistencia en el microservicio Billing. La resolución automática se ejecutará a las 00:00.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Network,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getAdminOverview } from '../../api/adminApi';
import { useAuth } from '../../auth/AuthContext';

const metricConfig = [
  { id: 'users', label: 'Usuarios', description: 'Cuentas de acceso', icon: ShieldCheck, color: 'accent' },
  { id: 'students', label: 'Estudiantes', description: 'Expedientes activos', icon: GraduationCap, color: 'success' },
  { id: 'teachers', label: 'Docentes', description: 'Personal academico', icon: Users, color: 'accent' },
  { id: 'enrollments', label: 'Inscripciones', description: 'Matricula registrada', icon: Activity, color: 'warning' },
  { id: 'courses', label: 'Cursos', description: 'Oferta academica', icon: BookOpen, color: 'success' },
  { id: 'school-cycles', label: 'Ciclos activos', description: 'Periodos vigentes', icon: CheckCircle2, color: 'accent' },
];

const quickActions = [
  { id: 'identity', label: 'Identidad', description: 'Usuarios, estudiantes, docentes y tutores', icon: ShieldCheck },
  { id: 'academic', label: 'Academico', description: 'Cursos, grados, aulas, ciclos y catalogos', icon: BookOpen },
  { id: 'operations', label: 'Operaciones', description: 'Inscripciones, horarios, asignaciones y notas', icon: Activity },
  { id: 'finance', label: 'Finanzas', description: 'Metodos de pago y registros financieros', icon: CreditCard },
  { id: 'infra', label: 'Infraestructura', description: 'Mapa de nodos, servicios y base de datos', icon: Network },
];

const colorClasses = {
  accent: 'bg-accent/10 text-accent border-accent/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
};

export function AdminDashboard({ onNavigate }) {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(null);

  const loadStats = () => {
    setIsLoading(true);
    getAdminOverview(token)
      .then((nextStats) => {
        setStats(nextStats);
        setLoadedAt(new Date());
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  return (
    <div className="page-transition space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_20rem]">
          <div className="relative p-6 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-success to-warning" />
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                <ShieldCheck size={14} />
                Panel administrativo
              </div>

              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-main lg:text-5xl">
                Resumen del sistema
              </h2>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-sec">
                Vista inicial para revisar el estado general de la institucion y entrar rapido a las areas de gestion.
              </p>
            </div>
          </div>

          <aside className="border-t border-border bg-base/45 p-6 xl:border-l xl:border-t-0 lg:p-8">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sec">Estado general</p>
                <p className="mt-2 text-sm font-black text-main">Informacion sincronizada</p>
                <p className="mt-2 text-xs font-medium leading-relaxed text-sec">
                  Los indicadores muestran los registros administrativos disponibles para consulta y gestion.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={loadStats}
                  disabled={isLoading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-accent/90 disabled:opacity-60"
                >
                  <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                  Actualizar datos
                </button>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sec">
                  {loadedAt ? `Actualizado ${loadedAt.toLocaleTimeString()}` : 'Sin sincronizar'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && stats.length === 0
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-lg border border-border bg-card" />
            ))
          : metricConfig.map((item) => (
              <Metric key={item.id} item={item} value={findValue(stats, item.id)} />
            ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-1 border-b border-border/60 pb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-main">Areas de trabajo</h3>
          <p className="text-xs font-medium text-sec">Accesos directos a las vistas donde el administrador gestiona informacion.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => (
            <QuickAction key={action.id} action={action} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ item, value }) {
  const Icon = item.icon;

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-sec">{item.label}</p>
          <p className="mt-3 text-5xl font-black tracking-tighter text-main">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${colorClasses[item.color] || colorClasses.accent}`}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-sec">{item.description}</p>
    </article>
  );
}

function QuickAction({ action, onNavigate }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate?.(action.id)}
      className="group flex min-h-32 flex-col justify-between rounded-lg border border-border bg-base/45 p-4 text-left transition hover:border-accent/45 hover:bg-accent/5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-sec group-hover:text-accent">
          <Icon size={18} />
        </div>
        <ArrowRight size={16} className="text-sec transition group-hover:translate-x-1 group-hover:text-accent" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-main">{action.label}</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-sec">{action.description}</p>
      </div>
    </button>
  );
}

function findValue(stats, id) {
  return Number(stats.find((stat) => stat.id === id)?.value || 0);
}

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, UserCog, Users } from 'lucide-react';
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
  'school-cycles': BookOpen,
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

    return () => {
      active = false;
    };
  }, [token]);

  const visibleStats = useMemo(() => {
    if (isLoading) {
      return ['Usuarios', 'Estudiantes', 'Docentes', 'Inscripciones'].map((label) => ({ label, value: null }));
    }
    return stats;
  }, [isLoading, stats]);

  return (
    <section className="space-y-6">
      <header className="border-b border-border pb-4">
        <p className="text-sm text-accent font-mono">ADMIN</p>
        <h2 className="text-2xl font-bold mt-1">Resumen institucional</h2>
        <p className="text-sm text-sec mt-2">Datos consultados desde los microservicios activos.</p>
      </header>

      {error && <div className="border border-warning/30 bg-warning/10 text-warning rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleStats.map((stat) => (
          <StatCard key={stat.id ?? stat.label} label={stat.label} value={stat.value} icon={icons[stat.id]} error={stat.error} />
        ))}
      </div>
    </section>
  );
}

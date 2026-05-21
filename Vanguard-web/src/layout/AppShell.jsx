import React from 'react';
import { BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, Users, UserCog } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const adminNavItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'users', label: 'Usuarios', icon: UserCog },
  { id: 'academic', label: 'Academico', icon: BookOpen },
  { id: 'people', label: 'Personas', icon: Users },
  { id: 'operations', label: 'Operaciones', icon: GraduationCap },
  { id: 'finance', label: 'Finanzas', icon: CreditCard },
];

export function AppShell({ currentView, onNavigate, children }) {
  const { user, role, logout } = useAuth();
  const navItems = role === 'ADMIN' ? adminNavItems : [{ id: 'home', label: 'Inicio', icon: LayoutDashboard }];

  return (
    <div className="min-h-screen bg-base text-main relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-success/5 rounded-full blur-[120px] pointer-events-none" />

      <aside className="w-64 h-screen cyber-panel flex flex-col justify-between border-y-0 border-l-0 rounded-none fixed left-0 top-0 z-20">
        <div>
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold tracking-wider">
              VANGUARD<span className="text-accent">-U</span>
            </h1>
            <p className="text-xs text-sec mt-1">Panel institucional</p>
          </div>
          <nav className="p-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-accent/10 text-accent border border-accent/30 shadow-[inset_2px_0_0_#6366F1]'
                    : 'text-sec hover:text-main hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border bg-black/20">
          <div className="p-3 rounded-lg bg-base border border-border">
            <p className="text-sm font-semibold truncate text-main">{user.username}</p>
            <p className="text-xs text-accent font-mono mt-1">{role}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-sec hover:text-main hover:border-accent/40 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8 relative z-10 h-screen overflow-auto">{children}</main>
    </div>
  );
}

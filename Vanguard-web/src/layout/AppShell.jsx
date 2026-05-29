import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  Command,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Network,
  RefreshCcw,
  Search,
  Sun,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';
import { useData } from '../context/DataContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

const adminNavItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'infra', label: 'Infraestructura', icon: Network },
  { id: 'users', label: 'Seguridad', icon: UserCog },
  { id: 'academic', label: 'Academico', icon: BookOpen },
  { id: 'people', label: 'Personas', icon: Users },
  { id: 'operations', label: 'Operaciones', icon: GraduationCap },
  { id: 'finance', label: 'Finanzas', icon: CreditCard },
  { id: 'audit', label: 'Auditoria', icon: Command },
];

const studentNavItems = [
  { id: 'dashboard', label: 'Mi Tablero', icon: LayoutDashboard },
  { id: 'courses', label: 'Mis Cursos', icon: BookMarked },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'finance', label: 'Pagos / Becas', icon: CreditCard },
];

const teacherNavItems = [
  { id: 'dashboard', label: 'Panel Docente', icon: LayoutDashboard },
  { id: 'assignments', label: 'Mis Clases', icon: ClipboardCheck },
  { id: 'attendance', label: 'Asistencia', icon: Users },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
];

export function AppShell({ currentView, onNavigate, children }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { refreshData, isLoading } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const navItems = role === 'ADMIN' ? adminNavItems : role === 'STUDENT' ? studentNavItems : role === 'TEACHER' ? teacherNavItems : [];
  const showSidebar = role !== 'PRE_INSCRITO';

  return (
    <div className="h-screen w-screen bg-base flex overflow-hidden transition-colors duration-500">
      {showSidebar && isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menu lateral"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {showSidebar && (
        <aside className={`fixed inset-y-0 left-0 z-[70] w-64 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-out glass-panel border-r-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full premium-border border-y-0 border-l-0">
            <div className="p-6 border-b border-border/40 flex items-center justify-between h-20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">VANGUARD<span className="text-accent">U</span></h1>
                  <p className="text-[8px] font-black text-sec uppercase tracking-[0.28em] mt-1 opacity-60">Academic Platform</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-sec hover:text-main" aria-label="Cerrar menu">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group ${
                    currentView === item.id
                      ? 'bg-accent/10 text-accent premium-border border-accent/30 shadow-sm'
                      : 'text-sec hover:text-main hover:bg-accent/5'
                  }`}
                >
                  <item.icon size={16} className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border/40 bg-base/40">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-sec hover:text-warning hover:bg-warning/5 transition-all group"
              >
                <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                Cerrar Sesion
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <header className="h-16 shrink-0 glass-panel border-x-0 border-t-0 flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {showSidebar && (
              <button type="button" onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-sec hover:text-main" aria-label="Abrir menu">
                <Menu size={20} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2.5 bg-base/50 premium-border rounded-lg px-4 py-2 w-full max-w-sm cursor-pointer hover:border-accent/40 transition-all text-left"
            >
              <Search size={14} className="text-sec" />
              <span className="text-xs text-sec/60 font-medium flex-1 truncate">Buscar modulos y registros</span>
              <span className="flex items-center gap-1 text-[8px] font-black text-sec bg-card px-1.5 py-0.5 rounded border border-border">
                <Command size={8} /> K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {role === 'ADMIN' && (
              <button
                type="button"
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 rounded-lg bg-card premium-border text-sec hover:text-accent transition-all active:scale-90 group"
                title="Sincronizar datos"
              >
                <RefreshCcw size={16} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
              </button>
            )}

            <button type="button" onClick={toggleTheme} className="p-2 rounded-lg bg-card premium-border text-sec hover:text-accent transition-all active:scale-90" aria-label="Cambiar tema">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button type="button" className="p-2 rounded-lg bg-card premium-border text-sec hover:text-accent relative" aria-label="Notificaciones">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full border-2 border-card" />
            </button>

            <div className="h-6 w-px bg-border/40 mx-1" />

            <div className="flex items-center gap-3 bg-card/50 premium-border pr-3 pl-1 py-1 rounded-lg group cursor-pointer hover:border-accent/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black shadow-lg shadow-accent/20">
                {user?.username?.[0].toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-main leading-none uppercase tracking-normal">{user?.username}</p>
                <p className="text-[8px] font-bold text-accent uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                  {role}
                </p>
              </div>
              <ChevronDown size={12} className="text-sec group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8 pb-24">
            {children}
          </div>
        </main>

        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

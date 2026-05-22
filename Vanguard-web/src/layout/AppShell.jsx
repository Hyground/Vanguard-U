import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, Users, UserCog, Sun, Moon, Calendar, ClipboardCheck, BookMarked, Search, Menu, X, Command, Network, Bell, ChevronDown
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

const adminNavItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'infra', label: 'Infraestructura', icon: Network },
  { id: 'users', label: 'Seguridad', icon: UserCog },
  { id: 'academic', label: 'Academico', icon: BookOpen },
  { id: 'people', label: 'Personas', icon: Users },
  { id: 'operations', label: 'Operaciones', icon: GraduationCap },
  { id: 'finance', label: 'Finanzas', icon: CreditCard },
  { id: 'audit', label: 'Auditoría', icon: Command },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleK = (e) => { 
      if (e.ctrlKey && e.key === 'k') { 
        e.preventDefault(); 
        setIsSearchOpen(true); 
      } 
    };
    window.addEventListener('keydown', handleK);
    return () => window.removeEventListener('keydown', handleK);
  }, []);

  const navItems = role === 'ADMIN' ? adminNavItems : role === 'STUDENT' ? studentNavItems : role === 'TEACHER' ? teacherNavItems : [];
  const showSidebar = role !== 'PRE_INSCRITO';

  return (
    <div className="h-screen w-screen bg-base flex overflow-hidden transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {showSidebar && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Content */}
      {showSidebar && (
        <aside className={`fixed inset-y-0 left-0 z-[70] w-72 transform lg:relative lg:translate-x-0 transition-transform duration-500 ease-out glass-panel border-r-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full premium-border border-y-0 border-l-0">
            <div className="p-8 border-b border-border/40 flex items-center justify-between h-24 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">VANGUARD<span className="text-accent">U</span></h1>
                  <p className="text-[9px] font-black text-sec uppercase tracking-[0.4em] mt-1.5 opacity-50">Core Engine 1.5</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-sec hover:text-main">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    currentView === item.id
                      ? 'bg-accent/10 text-accent premium-border border-accent/30 shadow-sm'
                      : 'text-sec hover:text-main hover:bg-accent/5'
                  }`}
                >
                  <item.icon size={18} className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-sm font-bold tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-border/40 bg-black/10">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-sec hover:text-warning hover:bg-warning/5 transition-all group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* Topbar */}
        <header className="h-24 shrink-0 glass-panel border-x-0 border-t-0 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6 flex-1">
            {showSidebar && (
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-sec hover:text-main">
                <Menu size={24} />
              </button>
            )}
            
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-3 bg-base/50 premium-border rounded-2xl px-5 py-3 w-full max-w-md cursor-pointer hover:border-accent/40 transition-all"
            >
              <Search size={18} className="text-sec" />
              <div className="text-sm text-sec/40 font-medium italic flex-1 text-left">Protocolo de búsqueda (Ctrl + K)</div>
              <div className="flex items-center gap-1 text-[10px] font-black text-sec bg-card px-2 py-1 rounded-lg border border-border">
                <Command size={10} /> K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-card premium-border text-sec hover:text-accent transition-all active:scale-90"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="p-3 rounded-2xl bg-card premium-border text-sec hover:text-accent relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-card" />
            </button>

            <div className="h-10 w-px bg-border/40 mx-2" />

            <div className="flex items-center gap-4 bg-card/50 premium-border pr-4 pl-1.5 py-1.5 rounded-2xl group cursor-pointer hover:border-accent/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black shadow-lg shadow-accent/20">
                {user?.username?.[0].toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-main leading-none uppercase tracking-tighter italic">{user?.username}</p>
                <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-1 opacity-70 flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                   {role}
                </p>
              </div>
              <ChevronDown size={14} className="text-sec group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 relative bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.02),transparent_40%)]">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
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

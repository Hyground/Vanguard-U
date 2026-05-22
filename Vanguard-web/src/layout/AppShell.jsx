import { 
  BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, Users, UserCog, Sun, Moon, Calendar, ClipboardCheck, BookMarked, Search, Menu, X, Command, Network, Bell, ChevronDown, RefreshCcw
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
  const { refreshData, isLoading } = useData();
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
        <aside className={`fixed inset-y-0 left-0 z-[70] w-64 transform lg:relative lg:translate-x-0 transition-transform duration-500 ease-out glass-panel border-r-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full premium-border border-y-0 border-l-0">
            <div className="p-6 border-b border-border/40 flex items-center justify-between h-20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">VANGUARD<span className="text-accent">U</span></h1>
                  <p className="text-[8px] font-black text-sec uppercase tracking-[0.4em] mt-1 opacity-50">Educational Platform</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-sec hover:text-main">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-300 group ${
                    currentView === item.id
                      ? 'bg-accent/10 text-accent premium-border border-accent/30 shadow-sm'
                      : 'text-sec hover:text-main hover:bg-accent/5'
                  }`}
                >
                  <item.icon size={16} className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border/40 bg-black/10">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-sec hover:text-warning hover:bg-warning/5 transition-all group"
              >
                <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 shrink-0 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4 flex-1">
            {showSidebar && (
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-sec hover:text-main">
                <Menu size={20} />
              </button>
            )}
            
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2.5 bg-base/50 premium-border rounded-xl px-4 py-2 w-full max-w-sm cursor-pointer hover:border-accent/40 transition-all"
            >
              <Search size={14} className="text-sec" />
              <div className="text-xs text-sec/40 font-medium italic flex-1 text-left">Protocolo de búsqueda (Ctrl + K)</div>
              <div className="flex items-center gap-1 text-[8px] font-black text-sec bg-card px-1.5 py-0.5 rounded border border-border">
                <Command size={8} /> K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === 'ADMIN' && (
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 rounded-xl bg-card premium-border text-sec hover:text-accent transition-all active:scale-90 group"
                title="Sincronizar Datos"
              >
                <RefreshCcw size={16} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-card premium-border text-sec hover:text-accent transition-all active:scale-90"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <button className="p-2 rounded-xl bg-card premium-border text-sec hover:text-accent relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full border-2 border-card" />
            </button>

            <div className="h-6 w-px bg-border/40 mx-1" />

            <div className="flex items-center gap-3 bg-card/50 premium-border pr-3 pl-1 py-1 rounded-xl group cursor-pointer hover:border-accent/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black shadow-lg shadow-accent/20">
                {user?.username?.[0].toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-main leading-none uppercase tracking-tighter italic">{user?.username}</p>
                <p className="text-[8px] font-bold text-accent uppercase tracking-widest mt-0.5 flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                   {role}
                </p>
              </div>
              <ChevronDown size={12} className="text-sec group-hover:translate-y-0.5 transition-transform" />
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

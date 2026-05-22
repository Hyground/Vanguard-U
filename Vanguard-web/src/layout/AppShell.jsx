import React, { useState } from 'react';
import { 
  BookOpen, CreditCard, GraduationCap, LayoutDashboard, LogOut, Users, UserCog, Sun, Moon, Calendar, ClipboardCheck, BookMarked, Search, Menu, X, Command, Network
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';

const adminNavItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'infra', label: 'Infraestructura', icon: Network },
  { id: 'users', label: 'Usuarios', icon: UserCog },
  { id: 'academic', label: 'Academico', icon: BookOpen },
  { id: 'people', label: 'Personas', icon: Users },
  { id: 'operations', label: 'Operaciones', icon: GraduationCap },
  { id: 'finance', label: 'Finanzas', icon: CreditCard },
];

const studentNavItems = [
  { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard },
  { id: 'courses', label: 'Cursos', icon: BookMarked },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'finance', label: 'Finanzas', icon: CreditCard },
];

const teacherNavItems = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'assignments', label: 'Clases', icon: ClipboardCheck },
  { id: 'attendance', label: 'Asistencia', icon: Users },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
];

export function AppShell({ currentView, onNavigate, children }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = role === 'ADMIN' ? adminNavItems : role === 'STUDENT' ? studentNavItems : role === 'TEACHER' ? teacherNavItems : [];
  const showSidebar = role !== 'PRE_INSCRITO';

  return (
    <div className="min-h-screen bg-base text-main relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <header className={`h-16 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-md ${showSidebar ? 'lg:pl-72' : ''}`}>
        <div className="flex items-center gap-4 flex-1">
          {showSidebar && <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2"><Menu size={24}/></button>}
          <div className="relative max-w-md w-full hidden md:block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sec"/><input type="text" placeholder="Buscador global (Ctrl + K)" className="w-full bg-base/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-accent" /></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-base border border-border text-sec hover:text-accent">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block"><p className="text-xs font-bold">{user?.username}</p><p className="text-[10px] text-accent uppercase font-mono">{role}</p></div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">{user?.username?.[0].toUpperCase()}</div>
          </div>
        </div>
      </header>

      {showSidebar && (
        <aside className={`w-64 h-screen cyber-panel flex flex-col justify-between border-y-0 border-l-0 rounded-none fixed left-0 top-0 z-50 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div><h1 className="text-xl font-bold tracking-wider">VANGUARD<span className="text-accent">-U</span></h1><p className="text-[10px] text-sec uppercase tracking-widest mt-0.5 font-bold opacity-60">System v1.2</p></div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={20}/></button>
            </div>
            <nav className="p-4 flex flex-col gap-1.5">
              {navItems.map((item) => (
                <button key={item.id} type="button" onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all ${currentView === item.id ? 'bg-accent/10 text-accent border border-accent/30 shadow-[inset_3px_0_0_#6366F1]' : 'text-sec hover:text-main hover:bg-white/5'}`}>
                  <item.icon size={20}/><span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-border bg-black/20"><button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-sec hover:text-main hover:border-warning/40 transition-all"><LogOut size={18}/> Cerrar sesión</button></div>
        </aside>
      )}

      <main className={`${showSidebar ? 'lg:ml-64 pt-16' : 'pt-4'} p-4 md:p-8 relative z-10 min-h-screen overflow-auto`}>{children}</main>
    </div>
  );
}

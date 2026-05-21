import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { AppShell } from './layout/AppShell';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminResourcePage } from './features/admin/AdminResourcePage';
import { RoleHome } from './features/RoleHome';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  const [currentView, setCurrentView] = useState('overview');

  if (!isAuthenticated) return <LoginPage />;

  const renderView = () => {
    if (role !== 'ADMIN') return <RoleHome />;

    if (currentView === 'overview') return <AdminDashboard />;
    if (currentView === 'users') return <AdminResourcePage group="Seguridad" />;
    if (currentView === 'academic') return <AdminResourcePage group="Academico" />;
    if (currentView === 'people') return <AdminResourcePage group="Personas" />;
    if (currentView === 'operations') return <AdminResourcePage group="Operaciones" />;
    if (currentView === 'finance') return <AdminResourcePage group="Finanzas" />;

    return <AdminDashboard />;
  };

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

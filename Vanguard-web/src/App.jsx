import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './layout/ThemeContext';
import { DataProvider } from './context/DataContext';
import { LoginPage } from './auth/LoginPage';
import { AppShell } from './layout/AppShell';

// Features
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminUserManagement } from './features/admin/AdminUserManagement';
import { AdminResourcePage } from './features/admin/AdminResourcePage';
import { InfrastructureMap } from './features/admin/InfrastructureMap';
import { AuditPanel } from './features/admin/AuditPanel';
import { PreEnrollmentPage } from './features/public/PreEnrollmentPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { CourseHubView } from './features/student/CourseHubView';
import { StudentFinanceView } from './features/student/StudentFinanceView';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { ClassManagementView } from './features/teacher/ClassManagementView';
import { AcademicCalendar } from './components/AcademicCalendar';

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  if (!isAuthenticated) return <LoginPage />;

  const renderView = () => {
    // 1. Rol Pre-Inscrito
    if (role === 'PRE_INSCRITO') return <PreEnrollmentPage />;

    // 2. Rol Estudiante
    if (role === 'STUDENT') {
      if (selectedCourse) return <CourseHubView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
      if (currentView === 'calendar') return <AcademicCalendar />;
      if (currentView === 'finance') return <StudentFinanceView />;
      return <StudentDashboard onSelectCourse={setSelectedCourse} />;
    }

    // 3. Rol Docente
    if (role === 'TEACHER') {
      if (selectedAssignment) return <ClassManagementView assignment={selectedAssignment} onBack={() => setSelectedAssignment(null)} />;
      if (currentView === 'calendar') return <AcademicCalendar />;
      return <TeacherDashboard onSelectAssignment={setSelectedAssignment} />;
    }

    // 4. Rol Admin
    if (role === 'ADMIN') {
      switch (currentView) {
        case 'infra': return <InfrastructureMap />;
        case 'identity': return <AdminUserManagement />;
        case 'academic': return <AdminResourcePage group="Academico" />;
        case 'operations': return <AdminResourcePage group="Operaciones" />;
        case 'finance': return <AdminResourcePage group="Finanzas" />;
        case 'audit': return <AuditPanel />;
        default: return <AdminDashboard />;
      }
    }

    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-black">Acceso Restringido</h2>
        <p className="text-sec">Tu rol ({role}) no tiene una vista asignada en este motor.</p>
      </div>
    );
  };

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      <div className="page-transition">
        {renderView()}
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

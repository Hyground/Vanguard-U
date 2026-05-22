import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './layout/ThemeContext';
import { LoginPage } from './auth/LoginPage';
import { AppShell } from './layout/AppShell';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminResourcePage } from './features/admin/AdminResourcePage';
import { InfrastructureMap } from './features/admin/InfrastructureMap';
import { RoleHome } from './features/RoleHome';

// Nuevas vistas
import { PreEnrollmentPage } from './features/public/PreEnrollmentPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { CourseHubView } from './features/student/CourseHubView';
import { StudentFinanceView } from './features/student/StudentFinanceView';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { GradeEntryView } from './features/teacher/GradeEntryView';
import { AttendanceControl } from './features/teacher/AttendanceControl';
import { AcademicCalendar } from './components/AcademicCalendar';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  if (!isAuthenticated) return <LoginPage />;

  const renderView = () => {
    if (role === 'PRE_INSCRITO') return <PreEnrollmentPage />;

    if (role === 'STUDENT') {
      if (selectedCourse) return <CourseHubView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
      if (currentView === 'calendar') return <AcademicCalendar />;
      if (currentView === 'finance') return <StudentFinanceView />;
      return <StudentDashboard onSelectCourse={setSelectedCourse} />;
    }

    if (role === 'TEACHER') {
      if (selectedAssignment) return <GradeEntryView assignment={selectedAssignment} onBack={() => setSelectedAssignment(null)} />;
      if (currentView === 'attendance') return <AttendanceControl assignment={null} onBack={() => setCurrentView('dashboard')} />;
      if (currentView === 'calendar') return <AcademicCalendar />;
      return <TeacherDashboard onSelectAssignment={setSelectedAssignment} />;
    }

    if (role === 'ADMIN') {
      if (currentView === 'overview') return <AdminDashboard />;
      if (currentView === 'infra') return <InfrastructureMap />;
      if (currentView === 'users') return <AdminResourcePage group="Seguridad" />;
      if (currentView === 'academic') return <AdminResourcePage group="Academico" />;
      if (currentView === 'people') return <AdminResourcePage group="Personas" />;
      if (currentView === 'operations') return <AdminResourcePage group="Operaciones" />;
      if (currentView === 'finance') return <AdminResourcePage group="Finanzas" />;
      return <AdminDashboard />;
    }

    return <RoleHome />;
  };

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

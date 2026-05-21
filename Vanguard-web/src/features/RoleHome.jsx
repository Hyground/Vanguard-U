import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';

export function RoleHome() {
  const { role } = useAuth();
  return (
    <EmptyState
      title={`Panel ${role}`}
      description="La base de administracion ya esta conectada. Las vistas especificas para este rol se implementan despues de cerrar el flujo admin."
    />
  );
}

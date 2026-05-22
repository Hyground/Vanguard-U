import React, { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';

const SESSION_STORAGE_KEY = 'vanguard_session';
const AuthContext = createContext(null);

function readStoredSession() {
  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = async (username, password) => {
    const response = await loginRequest(username.trim(), password);
    const nextSession = {
      token: response.token,
      user: {
        idUser: response.idUser,
        username: response.username,
        role: response.role,
      },
    };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const registerPreInscrito = async (userData) => {
    // Simulacion de registro
    const nextSession = {
      token: 'mock-jwt-' + Math.random().toString(36).substr(2),
      user: {
        idUser: Date.now(),
        username: userData.email.split('@')[0],
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'PRE_INSCRITO',
      },
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const upgradeToStudent = () => {
    if (!session) return;
    const personalCode = 'ST-' + Math.floor(100000 + Math.random() * 900000);
    const nextSession = {
      ...session,
      user: { ...session.user, role: 'STUDENT', personalCode }
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      token: session?.token,
      user: session?.user,
      role: session?.user?.role,
      isAuthenticated: Boolean(session?.token),
      login,
      registerPreInscrito,
      upgradeToStudent,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

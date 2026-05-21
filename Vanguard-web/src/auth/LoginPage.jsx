import React, { useState } from 'react';
import { AlertCircle, BadgeCheck, Cpu, Eye, EyeOff, KeyRound, LogIn, ShieldAlert, User } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccess = () => {
    setUsername('load_admin');
    setPassword('Demo123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-base text-main">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_26rem]">
        <section className="flex flex-col justify-between border-b border-border px-6 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-accent/15 flex items-center justify-center text-accent cyber-glow">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-wider">
                VANGUARD<span className="text-accent">-U</span>
              </h1>
              <p className="text-sec text-sm">Sistema academico integral</p>
            </div>
          </div>

          <div className="max-w-2xl space-y-6 py-16 lg:py-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-sec">
              <BadgeCheck size={14} className="text-accent" />
              Acceso administrativo con JWT
            </div>

            <div className="space-y-4">
              <h2 className="max-w-xl text-4xl font-bold leading-tight lg:text-5xl">
                Acceso seguro al panel institucional
              </h2>
              <p className="max-w-xl text-sec text-base leading-7">
                Inicia sesion con tus credenciales reales. El token se guarda en la sesion y el panel carga
                automaticamente el contexto segun tu rol.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sec">Sesion</p>
                <p className="mt-2 text-sm text-main">JWT en localStorage</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sec">Perfil</p>
                <p className="mt-2 text-sm text-main">ADMIN o vista por rol</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sec">Carga</p>
                <p className="mt-2 text-sm text-main">Datos directos del backend</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-sec">
            El acceso de prueba documentado es <span className="text-main font-medium">load_admin / Demo123!</span>
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 lg:px-8">
          <div className="cyber-panel w-full max-w-md p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-accent/10 text-accent">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-xl font-bold">Iniciar sesion</h2>
                <p className="mt-1 text-sm text-sec">Acceso autorizado para usuarios registrados.</p>
              </div>

              <button
                type="button"
                onClick={fillDemoAccess}
                className="rounded-lg border border-border bg-base px-3 py-2 text-xs text-sec hover:text-main hover:border-accent/40 transition-colors"
              >
                Cargar prueba
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-sec mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full bg-base border border-border rounded-lg py-3 pl-10 pr-3 text-main outline-none focus:border-accent"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-sec mb-2">
                  Contrasena
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-base border border-border rounded-lg py-3 pl-10 pr-10 text-main outline-none focus:border-accent"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sec hover:text-main"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 cyber-glow transition-colors"
              >
                <LogIn size={18} />
                {isSubmitting ? 'Validando...' : 'Entrar al panel'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

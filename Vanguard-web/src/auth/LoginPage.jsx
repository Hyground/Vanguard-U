import React, { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Contact2,
  Cpu,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LogIn,
  Mail,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useData } from '../context/DataContext';

export function LoginPage() {
  const { login, registerPreInscrito } = useAuth();
  const { addLog } = useData();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', cui: '', password: '' });

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
      addLog(username, 'Inicio sesion exitosamente', 'auth');
    } catch (err) {
      alert('Credenciales no autorizadas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTimeout(async () => {
      await registerPreInscrito(regData);
      addLog(regData.email, 'Se registro como aspirante (PRE_INSCRITO)', 'auth');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-base text-main transition-colors duration-500 overflow-hidden relative flex items-center justify-center p-4">
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.05fr_30rem] glass-panel rounded-2xl overflow-hidden shadow-2xl relative z-10 border-border/30">
        <section className="hidden lg:flex flex-col justify-center p-14 border-r border-border/20 bg-card/40 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-14 relative z-10">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent cyber-glow border border-accent/30 transition-transform hover:rotate-6 duration-500">
              <Cpu size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                VANGUARD<span className="text-accent">-U</span>
              </h1>
              <p className="text-[10px] font-black text-sec uppercase tracking-[0.28em] mt-2 opacity-70">Plataforma Academica</p>
            </div>
          </div>

          <div className="space-y-7 relative z-10">
            <h2 className="text-5xl font-black tracking-tighter leading-none uppercase italic text-main">
              {isRegister ? 'Registro de aspirante' : 'Inicio de sesion'}
            </h2>
            <p className="text-lg text-sec max-w-md leading-relaxed font-medium">
              {isRegister
                ? 'Completa tu pre-inscripcion para iniciar el proceso academico en Vanguard-U.'
                : 'Ingresa con tu usuario y contrasena para acceder al sistema.'}
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <BadgeCheck size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sec">Datos protegidos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                  <Fingerprint size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sec">Acceso por rol</span>
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-card/30">
          <div className="space-y-8">
            <div className="flex p-1.5 bg-base/50 premium-border rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${!isRegister ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${isRegister ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
              >
                Registro
              </button>
            </div>

            <div className="space-y-6">
              <header>
                <h3 className="text-2xl font-black text-main uppercase italic">
                  {isRegister ? 'Crear perfil aspirante' : 'Iniciar sesion'}
                </h3>
                <p className="text-xs text-sec font-medium mt-1">
                  {isRegister ? 'Completa tus datos para iniciar el proceso.' : 'Escribe tu usuario y contrasena.'}
                </p>
              </header>

              <form className="space-y-5" onSubmit={isRegister ? handleRegister : handleLogin}>
                {isRegister ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Nombres</label>
                        <input
                          type="text"
                          required
                          autoComplete="given-name"
                          placeholder="Ej. Carlos"
                          className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-3 px-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={(event) => setRegData({ ...regData, firstName: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Apellidos</label>
                        <input
                          type="text"
                          required
                          autoComplete="family-name"
                          placeholder="Ej. Mendez"
                          className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-3 px-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={(event) => setRegData({ ...regData, lastName: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">CUI (13 digitos)</label>
                      <div className="relative">
                        <Contact2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                        <input
                          type="text"
                          required
                          autoComplete="off"
                          placeholder="2000000000101"
                          className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={(event) => setRegData({ ...regData, cui: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Correo electronico</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="aspirante@vanguard.edu"
                          className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={(event) => setRegData({ ...regData, email: event.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Usuario / email</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="Usuario"
                        className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-accent transition-all"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Contrasena</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      placeholder="********"
                      className="login-input w-full bg-base/50 border border-border/50 rounded-lg py-4 pl-12 pr-12 text-sm font-bold outline-none focus:border-accent transition-all"
                      value={isRegister ? regData.password : password}
                      onChange={(event) => (isRegister ? setRegData({ ...regData, password: event.target.value }) : setPassword(event.target.value))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sec hover:text-main transition-colors"
                      aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-xl font-black uppercase tracking-[0.18em] text-xs shadow-xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                      {isRegister ? 'Crear registro' : 'Iniciar sesion'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-6 text-[10px] font-black text-sec uppercase tracking-[0.28em] opacity-50">
        2026 Vanguard-U Unified Academic OS
      </footer>
    </div>
  );
}


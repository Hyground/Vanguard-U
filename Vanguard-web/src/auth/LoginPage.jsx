import React, { useState } from 'react';
import { 
  ShieldAlert, UserPlus, User, KeyRound, Eye, EyeOff, LogIn, Cpu, BadgeCheck, Fingerprint, Mail, Contact2, ArrowRight
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
      addLog(username, 'Inició sesión exitosamente', 'auth');
    } catch (err) {
      alert('Credenciales no autorizadas por el núcleo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simular latencia de red
    setTimeout(async () => {
      await registerPreInscrito(regData);
      addLog(regData.email, 'Se registró como aspirante (PRE_INSCRITO)', 'auth');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-base text-main transition-colors duration-500 overflow-hidden relative flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[120px]" />

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.1fr_30rem] glass-panel rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-border/30">
        
        {/* Left Section: Branding */}
        <section className="hidden lg:flex flex-col justify-center p-16 border-r border-border/20 bg-black/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
          
          <div className="flex items-center gap-4 mb-16 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent cyber-glow border border-accent/30 transition-transform hover:rotate-12 duration-500">
              <Cpu size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                VANGUARD<span className="text-accent">-U</span>
              </h1>
              <p className="text-[10px] font-black text-sec uppercase tracking-[0.4em] mt-2 opacity-60">Plataforma Académica</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <h2 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-main to-sec/50">
              {isRegister ? 'Inicia tu futuro académico' : 'Acceso al núcleo central'}
            </h2>
            <p className="text-lg text-sec max-w-md leading-relaxed font-medium">
              {isRegister 
                ? 'Únete a la nueva era de gestión académica automatizada. Tu pre-inscripción toma menos de 2 minutos.'
                : 'Bienvenido de nuevo al portal oficial. Autentícate para acceder a tus herramientas de gestión y monitoreo.'}
            </p>

            <div className="flex flex-wrap gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <BadgeCheck size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sec">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                  <Fingerprint size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sec">Biometric Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Form */}
        <section className="p-8 lg:p-12 flex flex-col justify-center bg-card/30">
          <div className="space-y-8">
            <div className="flex p-1.5 bg-base/50 premium-border rounded-2xl shadow-inner">
              <button 
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${!isRegister ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
              >
                Identificación
              </button>
              <button 
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${isRegister ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
              >
                Registro
              </button>
            </div>

            <div className="space-y-6">
              <header>
                <h3 className="text-2xl font-black text-main uppercase italic">
                  {isRegister ? 'Crear Perfil Aspirante' : 'Verificación de Identidad'}
                </h3>
                <p className="text-xs text-sec font-medium mt-1">
                  {isRegister ? 'Complete los datos civiles para iniciar el wizard.' : 'Ingrese sus credenciales institucionales.'}
                </p>
              </header>

              <form className="space-y-5" onSubmit={isRegister ? handleRegister : handleLogin}>
                {isRegister ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Nombres</label>
                        <input 
                          type="text" required placeholder="Ej. Carlos"
                          className="w-full bg-base/50 border border-border/50 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={e => setRegData({...regData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Apellidos</label>
                        <input 
                          type="text" required placeholder="Ej. Méndez"
                          className="w-full bg-base/50 border border-border/50 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={e => setRegData({...regData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">CUI (13 Dígitos)</label>
                      <div className="relative">
                        <Contact2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                        <input 
                          type="text" required placeholder="2000 00000 0101"
                          className="w-full bg-base/50 border border-border/50 rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={e => setRegData({...regData, cui: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                        <input 
                          type="email" required placeholder="aspirante@vanguard.edu"
                          className="w-full bg-base/50 border border-border/50 rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-accent transition-all"
                          onChange={e => setRegData({...regData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Usuario / Email</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                      <input 
                        type="text" required placeholder="ID de Usuario"
                        className="w-full bg-base/50 border border-border/50 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-accent transition-all"
                        value={username} onChange={e => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-1">Contraseña de Seguridad</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                    <input 
                      type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                      className="w-full bg-base/50 border border-border/50 rounded-xl py-4 pl-12 pr-12 text-sm font-bold outline-none focus:border-accent transition-all"
                      value={isRegister ? regData.password : password}
                      onChange={e => isRegister ? setRegData({...regData, password: e.target.value}) : setPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sec hover:text-main transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                      {isRegister ? 'Iniciar Pre-Inscripción' : 'Autorizar Acceso'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {!isRegister && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-warning/5 border border-warning/20">
                  <ShieldAlert size={18} className="text-warning shrink-0" />
                  <p className="text-[10px] font-bold text-warning uppercase leading-tight tracking-wider">
                    Solo personal registrado puede acceder al núcleo administrativo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-6 text-[10px] font-black text-sec uppercase tracking-[0.4em] opacity-40">
        © 2026 Vanguard-U Unified Academic OS • Private Data Environment
      </footer>
    </div>
  );
}

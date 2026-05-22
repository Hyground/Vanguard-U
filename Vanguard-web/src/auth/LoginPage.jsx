import React, { useState } from 'react';
import { ShieldAlert, UserPlus, User, KeyRound, Eye, EyeOff, LogIn, Cpu } from 'lucide-react';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login, registerPreInscrito } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleLogin = async (e) => { e.preventDefault(); try { await login(username, password); } catch(err) { alert('Error al ingresar'); } };
  const handleRegister = async (e) => { e.preventDefault(); await registerPreInscrito(regData); };

  return (
    <div className="min-h-screen bg-base text-main grid grid-cols-1 lg:grid-cols-[1.1fr_30rem]">
      <section className="flex flex-col justify-center p-10 border-r border-border relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-12 relative z-10"><div className="w-12 h-12 rounded bg-accent/15 flex items-center justify-center text-accent cyber-glow"><Cpu size={28}/></div><div><h1 className="text-3xl font-bold tracking-wider">VANGUARD<span className="text-accent">-U</span></h1><p className="text-sec text-xs uppercase tracking-widest">Core Academic Engine</p></div></div>
        <div className="max-w-2xl space-y-6 relative z-10"><h2 className="text-6xl font-extrabold tracking-tighter">{isRegister ? 'Inicia tu futuro' : 'Acceso al panel'}</h2><p className="text-sec text-lg leading-relaxed">{isRegister ? 'Completa tu pre-inscripción en segundos.' : 'Introduce tus credenciales para acceder a tus servicios académicos.'}</p></div>
      </section>
      <section className="flex items-center justify-center p-10 bg-black/5">
        <div className="w-full max-w-md space-y-6">
          <div className="flex p-1 bg-card border border-border rounded-xl">
            <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegister ? 'bg-accent text-white' : 'text-sec'}`}>Login</button>
            <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegister ? 'bg-accent text-white' : 'text-sec'}`}>Registro</button>
          </div>
          <div className="cyber-panel p-8">
            <h2 className="text-2xl font-bold mb-8">{isRegister ? 'Registro Aspirante' : 'Identificación'}</h2>
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              {isRegister ? (
                <>
                  <input type="text" placeholder="Nombres" required className="w-full bg-base border border-border rounded-lg py-3 px-4 outline-none focus:border-accent" onChange={e => setRegData({...regData, firstName: e.target.value})}/>
                  <input type="email" placeholder="Correo" required className="w-full bg-base border border-border rounded-lg py-3 px-4 outline-none focus:border-accent" onChange={e => setRegData({...regData, email: e.target.value})}/>
                </>
              ) : (
                <input type="text" placeholder="Usuario" required className="w-full bg-base border border-border rounded-lg py-3 px-4 outline-none focus:border-accent" value={username} onChange={e => setUsername(e.target.value)}/>
              )}
              <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" required className="w-full bg-base border border-border rounded-lg py-3 px-4 outline-none focus:border-accent" value={isRegister ? regData.password : password} onChange={e => isRegister ? setRegData({...regData, password: e.target.value}) : setPassword(e.target.value)}/>
              <button type="submit" className="w-full bg-accent text-white py-3.5 rounded-lg font-bold shadow-lg transition-all active:scale-[0.98]">{isRegister ? 'Registrarse' : 'Entrar'}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

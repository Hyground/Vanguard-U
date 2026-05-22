import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Zap, Download, CheckCircle2, ArrowRight, Loader2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export function PreEnrollmentPage() {
  const { user, upgradeToStudent, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [billNumber, setBillNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handlePrint = () => { window.print(); setStep(2); };
  const handleValidate = async (e) => {
    e.preventDefault();
    if (!billNumber.trim()) return;
    setIsValidating(true); setError('');
    setTimeout(() => {
      if (billNumber.startsWith('B-2026-')) { upgradeToStudent(); }
      else { setError('Número de boleta no válido.'); setIsValidating(false); }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="print-only p-12 border-4 border-black text-black bg-white font-serif">
        <h1 className="text-4xl font-black uppercase">Vanguard-U</h1>
        <p className="font-mono text-xl mt-4">BOLETA B-2026-{Math.floor(Math.random() * 90000)}</p>
        <p className="mt-8 text-xl font-bold">{user?.firstName} {user?.lastName}</p>
        <div className="mt-8 border-t-2 border-black pt-4">
          <p className="flex justify-between font-bold"><span>Total a pagar:</span> <span>Q 500.00</span></p>
        </div>
      </div>

      <div className="no-print space-y-10 animate-in fade-in duration-700">
        <header className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-accent/10 text-accent mb-4 cyber-glow"><ShieldCheck size={40} /></div>
          <h2 className="text-4xl font-extrabold text-main">Activación Académica</h2>
          <p className="text-sec mt-2">Bienvenido, {user?.firstName}. Sigue los pasos para activar tu cuenta.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`cyber-panel p-8 ${step === 1 ? 'ring-2 ring-accent' : 'opacity-60'}`}>
            <h3 className="text-xl font-bold mb-4">1. Generar Boleta</h3>
            <button onClick={handlePrint} className="w-full bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
              <Download size={20} /> Imprimir PDF
            </button>
          </div>
          <div className={`cyber-panel p-8 ${step === 2 ? 'ring-2 ring-accent' : 'opacity-60'}`}>
            <h3 className="text-xl font-bold mb-4">2. Validar Pago</h3>
            <form onSubmit={handleValidate} className="space-y-4">
              <input 
                type="text" disabled={step === 1} value={billNumber} 
                onChange={(e) => setBillNumber(e.target.value.toUpperCase())}
                placeholder="B-2026-XXXXX"
                className="w-full bg-base border border-border rounded-xl py-4 px-4 text-main outline-none focus:border-accent"
              />
              {error && <p className="text-warning text-sm">{error}</p>}
              <button disabled={step === 1 || isValidating} className="w-full bg-success text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                {isValidating ? <Loader2 className="animate-spin" /> : <Zap size={20} />} Validar Pago
              </button>
            </form>
          </div>
        </div>
        <button onClick={logout} className="block mx-auto text-sec hover:text-main underline">Cerrar Sesión</button>
      </div>
    </div>
  );
}

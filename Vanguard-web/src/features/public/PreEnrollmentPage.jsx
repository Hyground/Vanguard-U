import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Zap, Download, CheckCircle2, ArrowRight, Loader2, AlertTriangle, Cpu, Terminal, Printer, Smartphone
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function PreEnrollmentPage() {
  const { user, upgradeToStudent, logout } = useAuth();
  const { addLog } = useData();
  const [step, setStep] = useState(1); // 1: Generate, 2: Validate, 3: Success
  const [billNumber, setBillNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationLog, setValidationLog] = useState([]);
  const [error, setError] = useState('');

  const generatedId = `B-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
    addLog(user?.username, `Generó boleta de pago ${generatedId}`, 'billing');
    setStep(2);
  };

  const simulateIA = async () => {
    setIsValidating(true);
    setError('');
    setValidationLog(['Iniciando protocolo de validación...', 'Conectando con base de datos de pagos...', 'Verificando firma digital de boleta...']);

    const steps = [
      'Analizando metadatos de transacción...',
      'Correlación de CUI detectada: 100% match.',
      'Pago confirmado.',
      'Generando código personal de estudiante...',
      'Validación completada con éxito.'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setValidationLog(prev => [...prev, steps[i]]);
    }

    setTimeout(() => {
      upgradeToStudent();
      addLog(user?.username, `Validó pago exitosamente. Ascendido a STUDENT.`, 'auth');
    }, 500);
  };

  const handleValidate = (e) => {
    e.preventDefault();
    if (!billNumber.includes('B-2026-')) {
      setError('Formato de boleta incorrecto. Debe iniciar con B-2026-');
      return;
    }
    simulateIA();
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 relative min-h-screen">
      
      {/* BOLETA BANCARIA CSS (Solo impresión) */}
      <div className="print-only p-16 border-[4px] border-black text-black bg-white font-serif relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-black text-white flex items-center justify-center -rotate-45 translate-x-12 -translate-y-12">
          <span className="font-black text-xs uppercase">Original</span>
        </div>
        
        <header className="flex justify-between items-start border-b-4 border-black pb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">Vanguard-U</h1>
            <p className="text-sm font-bold mt-1">SISTEMA UNIVERSITARIO DE GESTIÓN SUPERIOR</p>
            <p className="text-xs mt-4">Emisión: Mayo 2026 • Ciudad de Guatemala</p>
          </div>
          <div className="text-right space-y-2">
            <div className="bg-black text-white px-6 py-2 font-black text-xl">BOLETA DE PAGO</div>
            <p className="font-mono text-2xl font-black">{generatedId}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-16 my-12">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Aspirante Registrado</p>
              <p className="text-2xl font-black uppercase">{user?.firstName} {user?.lastName}</p>
              <p className="font-mono text-sm text-gray-600 mt-1">CUI: {user?.cui || 'N/A'}</p>
            </div>
            <div className="pt-6 border-t border-gray-200">
              <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Instrucciones de Pago</p>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Presentar este documento en ventanilla bancaria.</li>
                <li>Mencione el convenio: VANGUARD-INSTITUTIONAL.</li>
                <li>Una vez pagado, valide el código en su panel privado.</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-100 p-8 rounded-3xl border-2 border-black flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-4">Detalle de Arancel</p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Pago de Inscripción Ciclo 2026</span>
                <span className="font-mono font-black">Q 500.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-sm italic">Gestión de Expediente Digital</span>
                <span className="font-mono font-bold">Q 0.00</span>
              </div>
            </div>
            <div className="border-t-2 border-black mt-6 pt-6 flex justify-between items-center text-3xl font-black">
              <span>TOTAL</span>
              <span>Q 500.00</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-12 border-t-2 border-black border-dashed mt-12">
          <div className="h-32 w-full flex items-center justify-around px-8 opacity-80">
            {Array.from({length: 60}).map((_, i) => (
              <div key={i} className="bg-black" style={{ width: `${Math.random() * 5 + 1}px`, height: `${Math.random() * 60 + 40}%` }} />
            ))}
          </div>
        </div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          Digital Signature: VNG-SECURE-AUTH-2026-X8841-B
        </p>
      </div>

      {/* UI NORMAL */}
      <div className="no-print space-y-12 page-transition">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-accent/10 text-accent mb-2 cyber-glow border border-accent/20 relative group">
             <div className="absolute inset-0 bg-accent/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <ShieldCheck size={48} className="relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic">
              Activación de Cuenta <span className="text-accent">Vanguard</span>
            </h2>
            <p className="text-sec text-lg font-medium max-w-2xl mx-auto">
              Bienvenido, <span className="text-accent font-bold">{user?.firstName}</span>. Tu perfil ha sido indexado con éxito. Para habilitar el acceso total a los cursos, completa los siguientes pasos obligatorios.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-10 relative">
          {/* Step 1: Boleta */}
          <div className={`glass-panel p-10 rounded-[2.5rem] transition-all duration-700 relative overflow-hidden ${step === 1 ? 'ring-2 ring-accent shadow-2xl scale-[1.02]' : 'opacity-40 scale-95'}`}>
            <div className="absolute top-0 right-0 p-8 text-accent/10 -rotate-12">
              <Printer size={120} strokeWidth={3} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-accent/40">1</div>
                <div>
                  <h3 className="text-2xl font-black text-main uppercase italic">Generar Arancel</h3>
                  <p className="text-sm text-sec font-bold uppercase tracking-widest">Pago Único de Inscripción</p>
                </div>
              </div>

              <div className="bg-base/40 rounded-3xl p-8 premium-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sec font-bold uppercase text-xs tracking-widest">Concepto</span>
                  <span className="text-main font-black uppercase text-sm">Matrícula 2026</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sec font-bold uppercase text-xs tracking-widest">Monto</span>
                  <div className="text-right">
                    <p className="text-4xl font-black text-success tracking-tighter">Q 500.00</p>
                    <p className="text-[10px] text-sec font-bold uppercase mt-1">IVA Incluido</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePrint}
                className="w-full bg-accent hover:bg-accent/90 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                <Download size={18} className="group-hover:translate-y-1 transition-transform duration-300" />
                Descargar Boleta PDF
              </button>
            </div>
          </div>

          {/* Step 2: Validar */}
          <div className={`glass-panel p-10 rounded-[2.5rem] transition-all duration-700 relative overflow-hidden ${step === 2 ? 'ring-2 ring-accent shadow-2xl scale-[1.02]' : 'opacity-40 scale-95'}`}>
            <div className="absolute top-0 right-0 p-8 text-accent/10 -rotate-12">
              <Cpu size={120} strokeWidth={3} />
            </div>

            <div className="relative z-10 space-y-8 h-full flex flex-col">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-accent/40">2</div>
                <div>
                  <h3 className="text-2xl font-black text-main uppercase italic">Validación con IA</h3>
                  <p className="text-sm text-sec font-bold uppercase tracking-widest">Verificación Instantánea</p>
                </div>
              </div>

              {isValidating ? (
                <div className="flex-1 bg-black/60 rounded-3xl p-6 font-mono text-[11px] space-y-2 overflow-hidden premium-border border-accent/30 shadow-inner">
                  {validationLog.map((log, i) => (
                    <p key={i} className={`flex gap-3 ${log.includes('SUCCESS') ? 'text-success' : 'text-accent'}`}>
                      <span className="opacity-40">[{new Date().toLocaleTimeString([], {hour12:false})}]</span>
                      <span className="font-bold">{log}</span>
                    </p>
                  ))}
                  <div className="w-2 h-4 bg-accent animate-pulse inline-block ml-2" />
                </div>
              ) : (
                <form onSubmit={handleValidate} className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-sec uppercase tracking-[0.2em] ml-2">Código de Boleta Pagada</label>
                    <div className="relative">
                      <Terminal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                      <input 
                        type="text" required disabled={step === 1}
                        placeholder="Ej. B-2026-8841"
                        className="w-full bg-base/50 border border-border/50 rounded-2xl py-5 pl-12 pr-4 text-sm font-black uppercase outline-none focus:border-accent transition-all placeholder:opacity-20"
                        value={billNumber} onChange={e => setBillNumber(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center gap-3 text-warning text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle size={18} /> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={step === 1 || !billNumber}
                    className="w-full bg-success hover:bg-success/90 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-success/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    <Zap size={18} className="group-hover:scale-125 transition-transform duration-500" />
                    Procesar con IA CLI
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <footer className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sec">
                 <Smartphone size={14} /> Mobile App Sync
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sec">
                 <ShieldCheck size={14} /> End-to-End Encryption
              </div>
           </div>
           <button onClick={logout} className="text-[10px] font-black uppercase tracking-[0.3em] text-sec hover:text-warning transition-colors border-b border-transparent hover:border-warning">
             Abortar Proceso y Salir
           </button>
        </footer>
      </div>
    </div>
  );
}

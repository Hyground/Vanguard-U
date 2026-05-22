import React, { useState, useMemo } from 'react';
import { 
  CreditCard, History, Download, TrendingUp, AlertCircle, FileText, CheckCircle2, Calendar, ShieldCheck, Zap, ArrowUpRight, Loader2, Printer, Smartphone, DollarSign
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function StudentFinanceView() {
  const { user } = useAuth();
  const { addLog } = useData();
  const [isProcessing, setIsProcessing] = useState(false);

  // Historial formal de transacciones académicas (Simulando lo que vendría de billing-ms)
  const payments = [
    { id: 'VNG-PAY-8841-B', concept: 'Matrícula de Inscripción Ciclo 2026', date: '05 Mayo 2026', amount: 500, method: 'Banca en Línea', status: 'Approved' },
    { id: 'VNG-PAY-9012-C', concept: 'Cuota Universitaria Mensual - Mayo', date: '15 Mayo 2026', amount: 350, method: 'Tarjeta Crédito/Débito', status: 'Approved' },
  ];

  const totalAbonado = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);

  const handleGenerateInvoice = (payment) => {
    addLog(user.username, `DESCARGÓ COMPROBANTE DE PAGO: ${payment.id}`, 'billing');
    window.print();
  };

  const handleManualBill = () => {
    setIsProcessing(true);
    setTimeout(() => {
      addLog(user.username, `GENERÓ BOLETA ANTICIPADA: Cuota Junio 2026`, 'billing');
      window.print();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 page-transition">
      
      {/* Header Premium Refactorizado */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b border-border/50 pb-12">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                 Finanzas Auditadas
              </span>
              <span className="h-1 w-1 rounded-full bg-sec/30" />
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-40">Billing ID: VNG-USER-{user?.idUser}</span>
            </div>
            <h2 className="text-7xl font-black tracking-tighter text-main uppercase italic leading-none">
              Gestión <span className="text-accent">Financiera</span>
            </h2>
            <p className="text-sec text-xl font-medium italic opacity-70">Supervisión de aranceles, subsidios y solvencia de expedientes.</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="glass-panel px-10 py-6 rounded-[2.5rem] premium-border flex items-center gap-8 bg-emerald-500/[0.02] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 animate-pulse">
              <ShieldCheck size={80} />
           </div>
           <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={32} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">Estado de Cartera</p>
              <p className="text-4xl font-black text-main uppercase italic tracking-tighter">Solvente</p>
           </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         <div className="glass-panel p-10 rounded-[3rem] premium-border space-y-8 group hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-accent/5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
               <CreditCard size={150} />
            </div>
            <div className="flex justify-between items-start relative z-10">
               <div className="p-4 rounded-2xl bg-accent/10 text-accent border border-accent/20 shadow-xl"><DollarSign size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest italic opacity-40">Next Deadline</span>
            </div>
            <div className="space-y-1 relative z-10">
               <p className="text-5xl font-black text-main italic tracking-tighter italic">Q 350.00</p>
               <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                 <Calendar size={12} /> Vence el 05 de Junio
               </p>
            </div>
         </div>

         <div className="glass-panel p-10 rounded-[3rem] premium-border space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div className="p-4 rounded-2xl bg-base border border-border text-sec shadow-inner"><History size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest italic opacity-40">Total Year Abonado</span>
            </div>
            <div className="space-y-1 relative z-10">
               <p className="text-5xl font-black text-main italic tracking-tighter italic">Q {totalAbonado.toFixed(2)}</p>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Ciclo Académico 2026</p>
            </div>
         </div>

         <div className="glass-panel p-10 rounded-[3rem] premium-border space-y-8 bg-accent/[0.02] border-accent/20 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl"><TrendingUp size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest italic opacity-40">Subsidios / Becas</span>
            </div>
            <div className="space-y-1 relative z-10">
               <p className="text-5xl font-black text-emerald-400 italic tracking-tighter italic">0.0<span className="text-2xl opacity-20 ml-1">%</span></p>
               <p className="text-[10px] font-black text-sec uppercase tracking-[0.3em]">Sin beneficios activos</p>
            </div>
         </div>
      </div>

      {/* Transaction Ledger */}
      <section className="space-y-8">
         <h3 className="text-3xl font-black text-main uppercase italic flex items-center gap-4 px-2">
            <FileText className="text-accent" size={28} />
            Libro de Transacciones <span className="text-sec text-sm not-italic opacity-40 font-mono">[{payments.length}]</span>
         </h3>
         
         <div className="glass-panel rounded-[3rem] overflow-hidden premium-border shadow-2xl relative bg-black/10">
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                     <tr className="bg-black/30 border-b border-border/50">
                        <th className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em]">ID de Transacción</th>
                        <th className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em]">Concepto de Arancel</th>
                        <th className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em]">Fecha de Operación</th>
                        <th className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em]">Monto Ejecutado</th>
                        <th className="p-10 text-[10px] font-black text-accent uppercase tracking-[0.4em] text-right">Protocolo PDF</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                     {payments.map((p) => (
                       <tr key={p.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                          <td className="p-10 font-mono text-xs text-accent font-black tracking-tighter italic opacity-60">#{p.id}</td>
                          <td className="p-10">
                             <div className="flex items-center gap-5">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_#10B981] animate-pulse" />
                                <div className="space-y-1">
                                   <span className="text-base font-black text-main uppercase italic italic tracking-tighter leading-tight">{p.concept}</span>
                                   <p className="text-[9px] font-bold text-sec uppercase tracking-widest opacity-50">Método: {p.method}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-10 text-xs text-sec font-black uppercase tracking-widest italic opacity-60">{p.date}</td>
                          <td className="p-10 font-black text-main italic text-2xl tracking-tighter">Q {p.amount.toFixed(2)}</td>
                          <td className="p-10 text-right">
                             <button 
                               onClick={() => handleGenerateInvoice(p)}
                               className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-base border border-border text-[10px] font-black uppercase tracking-widest text-sec hover:text-accent hover:border-accent/40 transition-all duration-300 group/btn shadow-xl active:scale-90"
                             >
                                <Download size={14} className="group-hover/btn:translate-y-1 transition-transform" />
                                Generar Comprobante
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Action CTA Refactor HD */}
      <div className="glass-panel p-12 rounded-[3.5rem] premium-border border-accent/40 bg-accent/[0.03] flex flex-col xl:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform duration-[3s] group-hover:rotate-45">
            <Zap size={250} strokeWidth={3} />
         </div>
         
         <div className="flex flex-col md:flex-row items-start md:items-center gap-10 relative z-10 flex-1">
            <div className="w-24 h-24 rounded-[2rem] bg-accent text-white flex items-center justify-center shadow-[0_20px_50px_rgba(99,102,241,0.4)] border border-white/20 animate-bounce-slow">
               <Calendar size={48} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
               <h4 className="text-5xl font-black text-main uppercase italic tracking-tighter leading-none">Emisión de Arancel <span className="text-accent">Junio</span></h4>
               <p className="text-sec text-lg font-medium max-w-2xl leading-relaxed italic opacity-80">
                  Anticípate al cierre de sistema. Genera tu boleta de pago para la cuota mensual de **Junio 2026** y mantén tu integridad académica operativa.
               </p>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row gap-6 shrink-0 relative z-10 w-full xl:w-auto">
            <button 
              onClick={handleManualBill}
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90 text-white px-12 py-6 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(99,102,241,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
               {isProcessing ? <Loader2 className="animate-spin" /> : <Printer size={20} className="group-hover:scale-110 transition-transform" />}
               Imprimir Boleta Junio
            </button>
            <button className="px-8 py-6 rounded-[1.8rem] bg-card border border-border text-sec hover:text-main hover:border-accent/40 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
               <Smartphone size={20} />
               Pagar vía App
            </button>
         </div>
      </div>

    </div>
  );
}

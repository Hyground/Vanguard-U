import React, { useState } from 'react';
import { 
  CreditCard, History, Download, TrendingUp, AlertCircle, FileText, CheckCircle2, Calendar, ShieldCheck, Zap
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function StudentFinanceView() {
  const { user } = useAuth();
  const { addLog } = useData();
  const [isProcessing, setIsProcessing] = useState(false);

  const payments = [
    { id: 'PAY-8841-B', concept: 'Matrícula Ciclo 2026', date: '05 Mayo 2026', amount: 500, status: 'Paid' },
    { id: 'PAY-9012-C', concept: 'Cuota Mensual Mayo', date: '15 Mayo 2026', amount: 350, status: 'Paid' },
  ];

  const handleGenerateBill = () => {
    setIsProcessing(true);
    setTimeout(() => {
      window.print();
      addLog(user.username, `Generó boleta de pago para cuota mensual Junio 2026`, 'billing');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-10 page-transition">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-black tracking-widest uppercase border border-success/20">Finanzas Verificadas</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic">Billing System v1.5</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">
            Mi Gestión <span className="text-accent">Financiera</span>
          </h2>
          <p className="text-sec text-lg font-medium">Control de aranceles, becas y solvencia académica digital.</p>
        </div>

        <div className="glass-panel px-8 py-4 rounded-[2rem] premium-border flex items-center gap-4 bg-success/[0.02]">
           <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center text-success shadow-lg shadow-success/20 animate-pulse">
              <ShieldCheck size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-sec uppercase tracking-widest">Estado de Cuenta</p>
              <p className="text-2xl font-black text-main uppercase italic italic tracking-tighter">Solvente</p>
           </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6 group hover:border-accent/30 transition-all">
            <div className="flex justify-between items-start">
               <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20"><CreditCard size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest">Próximo Cargo</span>
            </div>
            <div className="space-y-1">
               <p className="text-4xl font-black text-main italic tracking-tighter">Q 350.00</p>
               <p className="text-[10px] font-bold text-sec uppercase tracking-widest">Vence el 05 de Junio</p>
            </div>
         </div>

         <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6">
            <div className="flex justify-between items-start">
               <div className="p-3 rounded-2xl bg-base border border-border text-sec"><History size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest">Total Abonado</span>
            </div>
            <div className="space-y-1">
               <p className="text-4xl font-black text-main italic tracking-tighter">Q 850.00</p>
               <p className="text-[10px] font-bold text-sec uppercase tracking-widest">Ciclo Académico 2026</p>
            </div>
         </div>

         <div className="glass-panel p-8 rounded-[2.5rem] premium-border space-y-6 bg-accent/[0.02]">
            <div className="flex justify-between items-start">
               <div className="p-3 rounded-2xl bg-success/10 text-success border border-success/20"><TrendingUp size={24} /></div>
               <span className="text-[10px] font-black text-sec uppercase tracking-widest">Crédito / Beca</span>
            </div>
            <div className="space-y-1">
               <p className="text-4xl font-black text-success italic tracking-tighter">0.0%</p>
               <p className="text-[10px] font-bold text-sec uppercase tracking-widest">Sin descuentos activos</p>
            </div>
         </div>
      </div>

      {/* Transaction History */}
      <section className="space-y-6">
         <h3 className="text-2xl font-black text-main uppercase italic flex items-center gap-3">
            <FileText className="text-accent" size={24} />
            Historial de Transacciones
         </h3>
         
         <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-border shadow-2xl">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-black/20 border-b border-border/50">
                        <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">ID Transacción</th>
                        <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Concepto Académico</th>
                        <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Fecha</th>
                        <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Monto</th>
                        <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em] text-right">Comprobante</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                     {payments.map((p) => (
                       <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-8 font-mono text-xs text-accent font-black tracking-tighter">{p.id}</td>
                          <td className="p-8">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#10B981]" />
                                <span className="text-sm font-black text-main uppercase italic">{p.concept}</span>
                             </div>
                          </td>
                          <td className="p-8 text-xs text-sec font-bold uppercase">{p.date}</td>
                          <td className="p-8 font-black text-main italic">Q {p.amount.toFixed(2)}</td>
                          <td className="p-8 text-right">
                             <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sec hover:text-accent transition-all group/btn">
                                <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                Descargar PDF
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Action CTA */}
      <div className="glass-panel p-10 rounded-[3rem] premium-border border-accent/30 bg-accent/[0.03] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
            <Zap size={150} />
         </div>
         <div className="flex items-start gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/40">
               <Calendar size={32} />
            </div>
            <div className="space-y-2">
               <h4 className="text-3xl font-black text-main uppercase italic tracking-tighter">¿Listo para tu próximo pago?</h4>
               <p className="text-sec text-sm font-medium max-w-xl leading-relaxed">
                  Genera tu boleta de pago para la cuota de **Junio 2026** de forma anticipada y evita recargos administrativos por mora.
               </p>
            </div>
         </div>
         <button 
           onClick={handleGenerateBill}
           disabled={isProcessing}
           className="relative z-10 bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
         >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
            Generar Boleta Junio
         </button>
      </div>

    </div>
  );
}

import React from 'react';
import { CreditCard, History, Download, TrendingUp, CheckCircle2 } from 'lucide-react';

export function StudentFinanceView() {
  const payments = [
    { id: 'PAY-101', concept: 'Matrícula 2026', date: '05 Mayo 2026', amount: 500 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end pb-6 border-b border-border">
        <h2 className="text-3xl font-extrabold text-main">Finanzas</h2>
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 px-4 py-2 rounded-xl text-success font-bold"><CheckCircle2 size={18}/> Solvente</div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-panel p-6 bg-accent/5 border-accent/20"><div className="text-accent font-bold mb-2">Próximo Pago</div><p className="text-3xl font-black">Q 350.00</p></div>
        <div className="cyber-panel p-6"><div className="font-bold mb-2">Total Pagado</div><p className="text-3xl font-black">Q 500.00</p></div>
      </div>
      <div className="cyber-panel overflow-hidden border-none shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-black/20 border-b border-border"><tr className="text-xs font-bold text-sec uppercase tracking-widest"><th className="p-4">ID</th><th className="p-4">Concepto</th><th className="p-4">Monto</th><th className="p-4 text-right">Acción</th></tr></thead>
          <tbody className="divide-y divide-border/50">{payments.map(p => (
            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-accent">{p.id}</td><td className="p-4 font-bold text-main">{p.concept}</td><td className="p-4 font-black">Q {p.amount}</td><td className="p-4 text-right"><button onClick={() => window.print()} className="text-sec hover:text-accent flex items-center gap-1 ml-auto"><Download size={14}/> PDF</button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

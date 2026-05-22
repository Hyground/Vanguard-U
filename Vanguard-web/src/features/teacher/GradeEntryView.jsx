import React, { useState } from 'react';
import { Save, ArrowLeft, CheckCircle2, Loader2, Info } from 'lucide-react';

export function GradeEntryView({ assignment, onBack }) {
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState([
    { id: 101, firstName: 'Carlos', lastName: 'Méndez', grades: { act1: 8 } },
    { id: 102, firstName: 'Ana', lastName: 'García', grades: { act1: 10 } },
  ]);
  const activities = [{ id: 'act1', name: 'Ensayo', max: 10 }];

  const handleSave = () => { setIsSaving(true); setTimeout(() => { setIsSaving(false); }, 2000); };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex justify-between items-end pb-6 border-b border-border">
        <div><button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-sec hover:text-accent mb-4"><ArrowLeft size={16}/> Volver</button><h2 className="text-4xl font-black text-main">{assignment.course}</h2><p className="text-sec">Sección {assignment.section} • Notas</p></div>
        <button onClick={handleSave} disabled={isSaving} className="bg-success text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">{isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Guardar</button>
      </header>
      <div className="cyber-panel overflow-hidden border-none shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black/40 border-b border-border"><tr className="text-xs font-bold text-sec uppercase tracking-widest"><th className="p-4">Estudiante</th>{activities.map(a => <th key={a.id} className="p-4 text-center">{a.name}</th>)}<th className="p-4 text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-border/50">{students.map(s => (
            <tr key={s.id} className="hover:bg-white/[0.02]"><td className="p-4"><p className="font-bold text-main">{s.firstName} {s.lastName}</p><p className="text-[10px] font-mono">#{s.id}</p></td><td className="p-4"><input type="number" value={s.grades.act1} className="w-20 mx-auto block bg-base border border-border rounded-lg py-2 text-center text-main font-bold outline-none focus:border-accent" /></td><td className="p-4 text-right font-black">8 / 10</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

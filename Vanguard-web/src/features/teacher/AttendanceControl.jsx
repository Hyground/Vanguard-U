import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, Save, Loader2, Calendar } from 'lucide-react';

export function AttendanceControl({ assignment, onBack }) {
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState([
    { id: 101, firstName: 'Carlos', lastName: 'Méndez', status: 'present' },
    { id: 102, firstName: 'Ana', lastName: 'García', status: 'absent' },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end pb-6 border-b border-border">
        <div><button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-sec hover:text-accent mb-4"><ArrowLeft size={16}/> Volver</button><h2 className="text-4xl font-black text-main">Asistencia</h2><p className="text-sec">{assignment?.course || 'Cargando...'}</p></div>
        <button onClick={() => { setIsSaving(true); setTimeout(() => setIsSaving(false), 1500); }} disabled={isSaving} className="bg-accent text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">{isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Finalizar</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(s => (
          <div key={s.id} className="cyber-panel p-4 flex justify-between items-center">
            <div><p className="text-sm font-bold text-main">{s.firstName}</p><p className="text-[10px] text-sec uppercase font-mono">ID: {s.id}</p></div>
            <div className="flex bg-card rounded-lg border border-border p-1 gap-1">
              <button className={`p-1.5 rounded ${s.status === 'present' ? 'bg-success text-white' : 'text-sec'}`}><CheckCircle size={18}/></button>
              <button className={`p-1.5 rounded ${s.status === 'absent' ? 'bg-warning text-white' : 'text-sec'}`}><XCircle size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

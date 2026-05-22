import React, { useState } from 'react';
import { 
  Users, ClipboardCheck, GraduationCap, ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Search, Filter, Info, X, Clock, User
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function ClassManagementView({ assignment, onBack }) {
  const { user } = useAuth();
  const { students, grades, updateGrade, attendance, markAttendance, finalizeAttendance } = useData();
  const [activeTab, setActiveTab] = useState('grades'); // 'grades' | 'attendance'
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Definición de actividades bimestrales
  const activities = [
    { id: 'act1', name: 'Ensayo Metodologías', max: 10 },
    { id: 'act2', name: 'Mapa Mental: Ciclo Vida', max: 15 },
    { id: 'exam', name: 'Examen Parcial I', max: 25 },
  ];

  const handleSaveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleFinalizeAttendance = () => {
    setIsSaving(true);
    setTimeout(() => {
      finalizeAttendance(user.username, assignment.name);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 page-transition">
      {/* Header Premium */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-sec hover:text-accent transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver a Asignaciones
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">
                Sección {assignment.section || 'A'}
              </span>
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-40">Asignación ID: #{assignment.id}00X</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">{assignment.name}</h2>
            <p className="text-sec text-lg font-medium">Gestión integral de rendimiento y presencialidad.</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-card premium-border rounded-2xl shadow-xl">
           <button 
             onClick={() => setActiveTab('grades')}
             className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'grades' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
           >
             <GraduationCap size={16} /> Notas
           </button>
           <button 
             onClick={() => setActiveTab('attendance')}
             className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'attendance' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-sec hover:text-main'}`}
           >
             <Users size={16} /> Asistencia
           </button>
        </div>
      </header>

      {showSuccess && (
        <div className="bg-success/10 border border-success/30 p-6 rounded-3xl flex items-center gap-4 text-success animate-in zoom-in duration-500 shadow-2xl shadow-success/5">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <p className="font-black uppercase tracking-widest text-sm">Protocolo de sincronización completado con éxito en el Core.</p>
        </div>
      )}

      {activeTab === 'grades' ? (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-sec">
                 <div className="px-4 py-2 rounded-xl bg-base border border-border flex items-center gap-2">
                    <Info size={14} className="text-accent" />
                    Bimestre II en curso
                 </div>
                 <div className="px-4 py-2 rounded-xl bg-base border border-border flex items-center gap-2">
                    <Clock size={14} className="text-warning" />
                    Cierre de actas: 15 de Junio
                 </div>
              </div>
              <button 
                onClick={handleSaveGrades}
                disabled={isSaving}
                className="flex items-center gap-3 bg-success hover:bg-success/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-success/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Sincronizando...' : 'Publicar Notas'}
              </button>
           </div>

           <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-border shadow-2xl">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 border-b border-border/50">
                      <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Alumno / ID</th>
                      {activities.map(act => (
                        <th key={act.id} className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em] text-center border-l border-border/10">
                          {act.name}
                          <span className="block text-accent mt-2 not-italic font-mono">Máx: {act.max}</span>
                        </th>
                      ))}
                      <th className="p-8 text-[10px] font-black text-accent uppercase tracking-[0.3em] text-right border-l border-border/10 bg-accent/5">
                        Promedio II
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {students.map((student) => {
                      const studentGrades = students.map(s => {
                        let total = 0;
                        activities.forEach(act => {
                          const val = grades[`${student.id}_${assignment.id}_${act.id}`] || 0;
                          total += val;
                        });
                        return total;
                      });
                      
                      const currentTotal = activities.reduce((acc, act) => acc + (grades[`${student.id}_${assignment.id}_${act.id}`] || 0), 0);
                      const maxPossible = activities.reduce((acc, act) => acc + act.max, 0);

                      return (
                        <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-base premium-border flex items-center justify-center font-black text-xs text-main shadow-inner group-hover:bg-accent/10 transition-colors group-hover:scale-110 duration-500">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-main uppercase italic">{student.firstName} {student.lastName}</p>
                                <p className="text-[10px] font-mono text-sec mt-1 opacity-40">UUID: {student.personalCode}</p>
                              </div>
                            </div>
                          </td>
                          {activities.map(act => (
                            <td key={act.id} className="p-8 border-l border-border/10">
                              <input 
                                type="number" 
                                className="w-20 mx-auto block bg-base/50 border border-border/50 rounded-xl py-3 text-center text-main font-black text-lg outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                value={grades[`${student.id}_${assignment.id}_${act.id}`] || ''}
                                onChange={(e) => updateGrade(student.id, assignment.id, act.id, e.target.value, user.username)}
                                placeholder="0"
                                max={act.max}
                              />
                            </td>
                          ))}
                          <td className="p-8 text-right border-l border-border/10 bg-accent/[0.02]">
                             <div className="space-y-1">
                                <span className={`text-2xl font-black italic tracking-tighter ${currentTotal >= (maxPossible * 0.6) ? 'text-success' : 'text-warning'}`}>
                                  {currentTotal.toFixed(1)}
                                </span>
                                <p className="text-[9px] font-black text-sec uppercase opacity-40">de {maxPossible} pts</p>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                 <h4 className="text-xl font-black text-main uppercase italic">Pase de Lista Diario</h4>
                 <p className="text-[10px] font-bold text-sec uppercase tracking-widest">Fecha del Sistema: {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <button 
                onClick={handleFinalizeAttendance}
                disabled={isSaving}
                className="bg-accent hover:bg-accent/90 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95"
              >
                {isSaving ? 'Procesando...' : 'Finalizar Asistencia'}
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {students.map(student => {
                const status = attendance[`${student.id}_${new Date().toDateString()}`] || 'none';
                return (
                  <div key={student.id} className="glass-panel p-6 rounded-[2rem] premium-border flex items-center justify-between group hover:border-accent/30 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-base premium-border flex items-center justify-center font-black text-sm text-sec group-hover:text-accent transition-colors">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-main uppercase italic">{student.firstName}</p>
                        <p className="text-[9px] font-bold text-sec uppercase tracking-widest">Matrícula: {student.personalCode}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 p-1.5 bg-base/50 rounded-2xl premium-border shadow-inner">
                       <button 
                        onClick={() => markAttendance(student.id, new Date().toDateString(), 'present', user.username)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${status === 'present' ? 'bg-success text-white shadow-lg' : 'text-sec hover:bg-success/10 hover:text-success'}`}
                        title="Presente"
                       >
                         <CheckCircle2 size={16} />
                       </button>
                       <button 
                        onClick={() => markAttendance(student.id, new Date().toDateString(), 'absent', user.username)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${status === 'absent' ? 'bg-warning text-white shadow-lg' : 'text-sec hover:bg-warning/10 hover:text-warning'}`}
                        title="Ausente"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 flex items-start gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Info size={120} />
              </div>
              <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2 relative z-10">
                <h5 className="font-black text-main uppercase italic tracking-tight">Regla de Negocio Académico</h5>
                <p className="text-sm text-sec leading-relaxed max-w-2xl">
                  Las faltas injustificadas se notifican automáticamente al tutor registrado. 3 faltas consecutivas inhabilitan el acceso al examen parcial de la unidad vigente.
                </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

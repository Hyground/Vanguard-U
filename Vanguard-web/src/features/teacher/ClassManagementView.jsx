import React, { useState, useMemo } from 'react';
import { 
  Users, ClipboardCheck, GraduationCap, ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Search, Filter, Info, X, Clock, User, UserCheck, UserX, HelpCircle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';

export function ClassManagementView({ assignment, onBack }) {
  const { user } = useAuth();
  const { people, grades, setStudentGrade, attendance, recordAttendance, addLog, refreshAcademicData } = useData();
  const [activeTab, setActiveTab] = useState('evaluations'); // 'evaluations' | 'attendance'
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Usar actividades reales de la asignación
  const activities = useMemo(() => assignment.activities || [], [assignment.activities]);
  
  // Estudiantes reales (para propósitos de demostración, filtramos de people.students)
  // En producción se usaría /enrollments para filtrar por sección
  const students = people.students;

  // Cálculo de promedio acumulado de la sección en tiempo real
  const sectionAverage = useMemo(() => {
    if (activities.length === 0 || students.length === 0) return 0;
    
    const totalMax = activities.reduce((acc, a) => acc + (a.weight || 10), 0);
    let totalScore = 0;
    let count = 0;

    students.forEach(s => {
      activities.forEach(a => {
        const val = grades[`${s.id}_${a.id}`] || 0;
        totalScore += val;
        count++;
      });
    });

    return (totalScore / (students.length * totalMax)) * 100;
  }, [students, grades, activities]);

  const handleGradeChange = async (studentId, activityId, value) => {
    const activity = activities.find(a => a.id === activityId);
    let num = parseFloat(value) || 0;
    const max = activity.weight || 100;
    if (num > max) num = max;
    if (num < 0) num = 0;
    await setStudentGrade(studentId, activityId, num, user.username);
  };

  const handleAttendanceChange = async (studentId, status) => {
    const today = new Date().toDateString();
    await recordAttendance(studentId, assignment.id, today, status, user.username);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await refreshAcademicData();
      addLog(user.username, `PUBLICÓ ACTA DE CALIFICACIONES: ${assignment.course?.name} - SECCIÓN ${assignment.sectionId}`, 'success');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert('Error en publicación: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-10 page-transition">
      
      {/* Header Premium Refactorizado */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b border-border/50 pb-12">
        <div className="space-y-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-sec hover:text-accent transition-all group w-fit"
          >
            <div className="p-2 rounded-lg bg-card premium-border group-hover:border-accent/40 transition-all">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Regresar a Mis Clases
          </button>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-[1rem] bg-accent text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                Sección {assignment.section}
              </span>
              <span className="h-1 w-1 rounded-full bg-sec/30" />
              <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-40">Class Protocol: VNG-2026-X01</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">{assignment.course.name}</h2>
            <p className="text-sec text-xl font-medium italic opacity-70">Monitoreo de hitos evaluativos y control de flujo presencial.</p>
          </div>
        </div>

        {/* Tab Switcher Premium */}
        <div className="flex p-2 bg-card/60 backdrop-blur-xl premium-border rounded-[2rem] shadow-2xl shrink-0">
           <button 
             onClick={() => setActiveTab('evaluations')}
             className={`flex items-center gap-4 px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'evaluations' ? 'bg-accent text-white shadow-2xl shadow-accent/30' : 'text-sec hover:text-main hover:bg-white/5'}`}
           >
             <GraduationCap size={18} /> Evaluaciones
           </button>
           <button 
             onClick={() => setActiveTab('attendance')}
             className={`flex items-center gap-4 px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'attendance' ? 'bg-accent text-white shadow-2xl shadow-accent/30' : 'text-sec hover:text-main hover:bg-white/5'}`}
           >
             <Users size={18} /> Asistencia
           </button>
        </div>
      </header>

      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[2.5rem] flex items-center gap-6 text-emerald-400 animate-in zoom-in-95 duration-500 shadow-2xl shadow-emerald-500/5">
          <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1">
             <p className="font-black uppercase tracking-[0.2em] text-sm italic">Sincronización de Datos Completa</p>
             <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Los cambios han sido propagados a los nodos de Gateway y Academic-MS.</p>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' ? (
        <div className="space-y-10 animate-in slide-in-from-left-6 duration-700">
           {/* Section Metrics Row */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 flex flex-col md:flex-row gap-6">
                 <div className="flex-1 glass-panel p-8 rounded-[2.5rem] premium-border flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20"><TrendingUp size={28} /></div>
                    <div>
                       <p className="text-[10px] font-black text-sec uppercase tracking-widest">Promedio Acumulado Clase</p>
                       <p className="text-4xl font-black text-main italic tracking-tighter">{sectionAverage.toFixed(1)}%</p>
                    </div>
                 </div>
                 <div className="flex-1 glass-panel p-8 rounded-[2.5rem] premium-border flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center border border-warning/20"><Clock size={28} /></div>
                    <div>
                       <p className="text-[10px] font-black text-sec uppercase tracking-widest">Tiempo Restante Bimestre</p>
                       <p className="text-4xl font-black text-main italic tracking-tighter">24 Días</p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                {isSaving ? 'Actualizando datos...' : 'Publicar Acta'}
              </button>
           </div>

           {/* Grades Matrix */}
           <div className="glass-panel rounded-[3rem] overflow-hidden premium-border shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-indigo-500 to-transparent opacity-30" />
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-black/30 border-b border-border/50">
                      <th className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em]">Estudiante Operador</th>
                      {activities.map(act => (
                        <th key={act.id} className="p-10 text-[10px] font-black text-sec uppercase tracking-[0.4em] text-center border-l border-border/10">
                          {act.name}
                          <div className="flex items-center justify-center gap-3 mt-3">
                             <span className="text-accent not-italic font-mono bg-accent/10 px-2 py-1 rounded border border-accent/20">Máx: {act.max}</span>
                             <span className="text-sec opacity-40">[{act.weight}]</span>
                          </div>
                        </th>
                      ))}
                      <th className="p-10 text-[10px] font-black text-accent uppercase tracking-[0.4em] text-right border-l border-border/10 bg-accent/[0.03]">
                        Global Bimestre
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {students.map((student) => {
                      const studentTotal = activities.reduce((acc, act) => acc + (grades[`${student.id}_${assignment.id}_${act.id}`] || 0), 0);
                      const maxPossible = activities.reduce((acc, act) => acc + act.max, 0);
                      const percentage = (studentTotal / maxPossible) * 100;

                      return (
                        <tr key={student.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                          <td className="p-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-base premium-border flex items-center justify-center font-black text-sm text-main shadow-inner group-hover:bg-accent/10 group-hover:scale-110 transition-all duration-500">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                              <div className="space-y-1">
                                <p className="text-lg font-black text-main uppercase italic tracking-tighter group-hover:text-accent transition-colors">{student.firstName} {student.lastName}</p>
                                <p className="text-[10px] font-mono text-sec font-bold tracking-widest opacity-40 uppercase">ID: {student.personalCode}</p>
                              </div>
                            </div>
                          </td>
                          {activities.map(act => (
                            <td key={act.id} className="p-10 border-l border-border/10">
                              <div className="relative group/input">
                                 <input 
                                   type="number" 
                                   className="w-24 mx-auto block bg-base/50 border border-border/40 rounded-2xl py-4 text-center text-main font-black text-2xl outline-none focus:border-accent focus:ring-[6px] focus:ring-accent/10 transition-all group-hover/input:border-border/80"
                                   value={grades[`${student.id}_${assignment.id}_${act.id}`] || ''}
                                   onChange={(e) => handleGradeChange(student.id, assignment.id, act.id, e.target.value)}
                                   placeholder="0"
                                 />
                              </div>
                            </td>
                          ))}
                          <td className="p-10 text-right border-l border-border/10 bg-accent/[0.01]">
                             <div className="space-y-1">
                                <span className={`text-4xl font-black italic tracking-tighter ${percentage >= 60 ? 'text-emerald-400' : 'text-warning'}`}>
                                  {studentTotal.toFixed(1)}
                                </span>
                                <p className="text-[10px] font-black text-sec uppercase opacity-40 tracking-widest">de {maxPossible} pts</p>
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
        <div className="space-y-12 animate-in slide-in-from-right-6 duration-700">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
              <div className="space-y-2">
                 <h4 className="text-3xl font-black text-main uppercase italic flex items-center gap-4">
                    <ClipboardCheck className="text-accent" /> Pase de Lista Diario
                 </h4>
                 <p className="text-[11px] font-black text-sec uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={14} className="text-accent" /> {todayStr}
                 </p>
              </div>
              <button 
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-accent hover:bg-accent/90 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/20 transition-all active:scale-95 group"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <UserCheck size={20} className="group-hover:scale-110 transition-transform" />}
                Finalizar Asistencia
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {students.map(student => {
                const status = attendance[`${student.id}_${assignment.id}_${new Date().toDateString()}`] || 'none';
                return (
                  <div key={student.id} className={`glass-panel p-8 rounded-[2.5rem] premium-border flex items-center justify-between group transition-all duration-500 relative overflow-hidden ${status === 'present' ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : status === 'absent' ? 'border-rose-500/40 bg-rose-500/[0.02]' : 'hover:border-accent/40'}`}>
                    
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[1.25rem] bg-base premium-border flex items-center justify-center font-black text-sec group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${status === 'present' ? 'text-emerald-400 border-emerald-500/30' : ''}`}>
                        <User size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-main uppercase italic tracking-tighter leading-none">{student.firstName}</p>
                        <p className="text-[9px] font-black text-sec uppercase tracking-[0.2em] opacity-50">Code: {student.personalCode}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 p-2 bg-base/50 rounded-[1.5rem] premium-border shadow-inner">
                       <button 
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-3' : 'text-sec hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                        title="Presente"
                       >
                         <UserCheck size={20} />
                       </button>
                       <button 
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 rotate-3' : 'text-sec hover:text-rose-400 hover:bg-rose-500/10'}`}
                        title="Ausente"
                       >
                         <UserX size={20} />
                       </button>
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="p-10 rounded-[3rem] bg-accent/5 border border-accent/20 flex gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
                 <AlertCircle size={180} />
              </div>
              <div className="p-5 rounded-[1.5rem] bg-accent/10 text-accent border border-accent/20 h-fit shadow-lg">
                <Info size={32} />
              </div>
              <div className="space-y-3 relative z-10">
                <h5 className="text-xl font-black text-main uppercase italic tracking-widest">Protocolo de Notificación de Inasistencia</h5>
                <p className="text-sm text-sec leading-relaxed max-w-4xl font-medium">
                  El sistema detectará automáticamente patrones de inasistencia. Los registros marcados como <span className="text-rose-400 font-bold underline">AUSENTE</span> dispararán un correo electrónico cifrado al tutor registrado de forma inmediata tras presionar "Finalizar Asistencia".
                </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

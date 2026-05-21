import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  BookOpen, Calendar as CalendarIcon, DollarSign, Terminal, 
  User, CheckCircle, Clock, UploadCloud, ShieldAlert, 
  FileText, ChevronDown, ChevronRight, Activity, LogOut, 
  Cpu, AlertCircle, LayoutDashboard
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USER = { name: "Carlos Daniel", cui: "1234567890123" };

const COURSES = [
  { id_course: 1, course_code: 'SYS-101', course_name: 'Análisis de Sistemas I', section: 'A', progress: 85 },
  { id_course: 2, course_code: 'DB-201', course_name: 'Bases de Datos II', section: 'B', progress: 60 },
  { id_course: 3, course_code: 'CMP-301', course_name: 'Compiladores', section: 'A', progress: 40 },
  { id_course: 4, course_code: 'OS-202', course_name: 'Sistemas Operativos II', section: 'C', progress: 90 },
  { id_course: 5, course_code: 'ARQ-102', course_name: 'Arquitectura de Computadoras I', section: 'A', progress: 20 },
];

const TODOS = [
  { id: 1, task: 'Entregar Práctica DB-201', date: 'Mañana, 23:59', urgent: true },
  { id: 2, task: 'Leer Capítulo 4 OS-202', date: 'Viernes, 14:00', urgent: false },
];

const GRADES = [
  { id: 1, course: 'Compiladores', activity: 'Examen Parcial', score: 18.5 },
  { id: 2, course: 'Análisis de Sistemas I', activity: 'Proyecto F1', score: 19.0 },
];

const COURSE_UNITS = [
  {
    id_unit: 1,
    unit_name: 'Unidad 1: Fundamentos',
    activities: [
      { id_activity: 101, activity_name: 'Práctica de Laboratorio 1', weight: 10.0, score_obtained: 18.0 },
      { id_activity: 102, activity_name: 'Examen Teórico', weight: 20.0, score_obtained: 15.5 },
    ]
  },
  {
    id_unit: 2,
    unit_name: 'Unidad 2: Desarrollo Avanzado',
    activities: [
      { id_activity: 103, activity_name: 'Avance de Proyecto', weight: 30.0, score_obtained: 19.5 },
      { id_activity: 104, activity_name: 'Examen Final', weight: 40.0, score_obtained: null },
    ]
  }
];

const SCHEDULES = [
  { id_schedule: 1, day: 15, type: 'class', course: 'SYS-101', detail: '08:00 - 10:00 Aula 101' },
  { id_schedule: 2, day: 18, type: 'class', course: 'DB-201', detail: '10:00 - 12:00 Lab A' },
  { id_schedule: 3, day: 22, type: 'deadline', course: 'CMP-301', detail: 'Entrega Proyecto Final' },
  { id_schedule: 4, day: 22, type: 'class', course: 'CMP-301', detail: '14:00 - 16:00 Aula 204' },
];

const FINANCE_HISTORY = [
  { id_payment: 101, method: 'Transferencia Bancaria', amount: 850.00, date: '2026-04-15 10:30', status: 'Aprobado' },
  { id_payment: 102, method: 'Tarjeta de Crédito', amount: 850.00, date: '2026-03-10 14:20', status: 'Aprobado' },
];

const SYSTEM_LOGS = [
  { id_log: 5012, user: 'admin_carlos', action: 'INSERT INTO users (username, role) VALUES (...)', date: '2026-05-20 08:15:22' },
  { id_log: 5013, user: 'admin_carlos', action: 'UPDATE enrollment SET status=1 WHERE id=142', date: '2026-05-20 09:30:10' },
  { id_log: 5014, user: 'system_ai', action: 'APPROVE payment_id=103 WITH CONFIDENCE 0.98', date: '2026-05-20 10:05:01' },
  { id_log: 5015, user: 'admin_carlos', action: 'DELETE FROM sessions WHERE active=0', date: '2026-05-20 11:22:40' },
];

// --- CONTEXT ---
const AuthContext = createContext();

// --- COMPONENTS ---

// 1. Dev Role Switcher
const DevRoleSwitcher = () => {
  const { role, setRole } = useContext(AuthContext);
  return (
    <div className="absolute top-4 right-4 z-50 bg-card border border-accent/30 rounded-lg p-2 flex items-center gap-3 cyber-glow">
      <div className="flex items-center gap-2 text-xs font-mono text-accent">
        <Terminal size={14} /> DEV_MODE:
      </div>
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value)}
        className="bg-base text-main text-xs border border-border rounded px-2 py-1 outline-none focus:border-accent font-mono"
      >
        <option value="STUDENT">STUDENT</option>
        <option value="TEACHER">TEACHER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    </div>
  );
};

// 2. Sidebar
const Sidebar = ({ currentView, setCurrentView }) => {
  const { role, user } = useContext(AuthContext);

  const navItems = [
    { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon, roles: ['STUDENT', 'TEACHER'] },
    { id: 'finance', label: 'Finanzas', icon: DollarSign, roles: ['STUDENT', 'ADMIN'] },
    { id: 'audit', label: 'Auditoría', icon: Terminal, roles: ['ADMIN'] },
  ];

  return (
    <div className="w-64 h-screen cyber-panel flex flex-col justify-between border-y-0 border-l-0 rounded-none fixed left-0 top-0">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent cyber-glow">
            <Cpu size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-wider">VANGUARD<span className="text-accent">-U</span></h1>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {navItems.filter(item => item.roles.includes(role)).map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 ${
                currentView === item.id || (currentView === 'course' && item.id === 'dashboard')
                  ? 'bg-accent/10 text-accent border border-accent/30 shadow-[inset_2px_0_0_#6366F1]'
                  : 'text-sec hover:text-main hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border bg-black/20">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-base border border-border">
          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-sec">
            <User size={20} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-main">{user.name}</p>
            <p className="text-xs text-accent font-mono">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Dashboard View
const DashboardView = ({ setCurrentView, setSelectedCourse }) => {
  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-bold border-b border-border pb-4">Mis Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSES.map(course => (
            <div 
              key={course.id_course} 
              onClick={() => { setSelectedCourse(course); setCurrentView('course'); }}
              className="cyber-panel p-5 cursor-pointer hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center group-hover:cyber-glow">
                  <BookOpen size={20} />
                </div>
                <span className="text-xs font-mono text-sec bg-base px-2 py-1 rounded border border-border">SEC: {course.section}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1 text-main">{course.course_name}</h3>
              <p className="text-sm text-sec font-mono">{course.course_code}</p>
              
              <div className="mt-6 w-full bg-base rounded-full h-1.5 border border-border">
                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-80 space-y-6">
        <div className="cyber-panel p-5">
          <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-warning" /> Por Hacer
          </h3>
          <div className="space-y-3">
            {TODOS.map(todo => (
              <div key={todo.id} className="p-3 bg-base border border-border rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">{todo.task}</p>
                  {todo.urgent && <span className="w-2 h-2 rounded-full bg-warning cyber-glow mt-1"></span>}
                </div>
                <p className="text-xs text-sec">{todo.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-panel p-5">
          <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-success" /> Valoración Reciente
          </h3>
          <div className="space-y-3">
            {GRADES.map(grade => (
              <div key={grade.id} className="p-3 bg-base border border-border rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{grade.activity}</p>
                  <p className="text-xs text-sec truncate w-40">{grade.course}</p>
                </div>
                <div className="text-lg font-bold text-success font-mono">{grade.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Course Module View
const CourseModuleView = ({ course, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [openUnits, setOpenUnits] = useState([1]);

  const toggleUnit = (id) => {
    setOpenUnits(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
        <button onClick={() => setCurrentView('dashboard')} className="text-sec hover:text-main">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{course.course_name}</h2>
          <p className="text-sm text-sec font-mono">{course.course_code} - Sección {course.section}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        <button 
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-accent text-accent' : 'border-transparent text-sec hover:text-main'}`}
          onClick={() => setActiveTab('content')}
        >Contenido del Curso</button>
        <button 
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'grades' ? 'border-accent text-accent' : 'border-transparent text-sec hover:text-main'}`}
          onClick={() => setActiveTab('grades')}
        >Calificaciones</button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {COURSE_UNITS.map(unit => (
              <div key={unit.id_unit} className="cyber-panel overflow-hidden">
                <button 
                  onClick={() => toggleUnit(unit.id_unit)}
                  className="w-full p-4 flex justify-between items-center bg-card hover:bg-white/5 transition-colors"
                >
                  <h3 className="font-semibold text-lg">{unit.unit_name}</h3>
                  <ChevronDown size={20} className={`text-sec transition-transform ${openUnits.includes(unit.id_unit) ? 'rotate-180' : ''}`} />
                </button>
                {openUnits.includes(unit.id_unit) && (
                  <div className="p-4 border-t border-border bg-base/50 space-y-3">
                    {unit.activities.map(act => (
                      <div key={act.id_activity} className="flex justify-between items-center p-3 border border-border rounded bg-base">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-accent" />
                          <span className="text-sm font-medium">{act.activity_name}</span>
                        </div>
                        <span className="text-xs text-sec bg-card px-2 py-1 rounded border border-border">Peso: {act.weight}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="cyber-panel p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sec text-sm uppercase tracking-wider">
                  <th className="pb-3">Actividad</th>
                  <th className="pb-3 text-center">Peso</th>
                  <th className="pb-3 text-right">Nota Obtenida</th>
                </tr>
              </thead>
              <tbody>
                {COURSE_UNITS.flatMap(u => u.activities).map(act => (
                  <tr key={act.id_activity} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-4 text-sm">{act.activity_name}</td>
                    <td className="py-4 text-sm text-center font-mono text-sec">{act.weight}%</td>
                    <td className="py-4 text-right font-mono font-bold">
                      {act.score_obtained !== null 
                        ? <span className="text-success cyber-glow-success px-2 py-1 rounded bg-success/10">{act.score_obtained.toFixed(1)}</span>
                        : <span className="text-sec">-</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Calendar View
const CalendarView = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 4; // Assuming May 1st is Friday

  const getEventsForDay = (day) => SCHEDULES.filter(s => s.day === day);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6">Calendario Académico - Mayo 2026</h2>
      
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border flex-1">
        {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(day => (
          <div key={day} className="bg-card p-3 text-center text-xs font-bold text-sec tracking-wider">{day}</div>
        ))}
        
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-base/50 p-2 min-h-[100px]"></div>
        ))}

        {daysInMonth.map(day => {
          const events = getEventsForDay(day);
          return (
            <div 
              key={day} 
              onClick={() => events.length && setSelectedDay({ day, events })}
              className={`bg-card p-2 min-h-[100px] border-t border-border transition-colors ${events.length ? 'hover:bg-white/5 cursor-pointer' : ''}`}
            >
              <div className="text-right text-sm text-sec font-mono mb-2">{day}</div>
              <div className="space-y-1">
                {events.map(ev => (
                  <div 
                    key={ev.id_schedule} 
                    className={`text-[10px] px-1.5 py-1 rounded font-medium truncate ${
                      ev.type === 'class' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-warning/20 text-warning border border-warning/30'
                    }`}
                  >
                    {ev.course}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="cyber-panel p-6 w-96 max-w-[90vw]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarIcon size={20} className="text-accent" />
              Eventos del {selectedDay.day} de Mayo
            </h3>
            <div className="space-y-4">
              {selectedDay.events.map(ev => (
                <div key={ev.id_schedule} className="bg-base p-3 rounded border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${ev.type === 'class' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
                      {ev.type === 'class' ? 'CLASE' : 'ENTREGA'}
                    </span>
                    <span className="text-sm font-mono">{ev.course}</span>
                  </div>
                  <p className="text-sm text-main mt-2">{ev.detail}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="mt-6 w-full py-2 bg-border hover:bg-border/80 rounded transition-colors text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. Finance View (Student + Admin)
const FinanceView = () => {
  const { role } = useContext(AuthContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    simulateAIProcessing();
  };

  const simulateAIProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        operation: 'OP-' + Math.floor(Math.random() * 1000000),
        amount: '850.00',
        date: new Date().toISOString().split('T')[0]
      });
    }, 2000);
  };

  if (role === 'ADMIN') {
    return (
      <div className="h-full">
        <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6 text-warning">Validaciones Pendientes (IA)</h2>
        <div className="cyber-panel p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sec text-sm uppercase tracking-wider">
                <th className="pb-3">Estudiante</th>
                <th className="pb-3">Operación AI</th>
                <th className="pb-3 text-right">Monto</th>
                <th className="pb-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-4 text-sm">Carlos Daniel (123456)</td>
                <td className="py-4 text-sm font-mono text-accent">OP-992144 (Confianza: 98%)</td>
                <td className="py-4 text-right font-mono font-bold">$850.00</td>
                <td className="py-4 text-center">
                  <button className="bg-success/20 text-success border border-success/30 px-3 py-1 rounded text-xs hover:bg-success hover:text-white transition-colors">Aprobar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      <div className="w-1/2 space-y-6">
        <h2 className="text-2xl font-bold border-b border-border pb-4">Historial de Pagos</h2>
        <div className="space-y-4">
          {FINANCE_HISTORY.map(pay => (
            <div key={pay.id_payment} className="cyber-panel p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{pay.method}</p>
                <p className="text-xs text-sec font-mono">{pay.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success text-lg font-mono">${pay.amount.toFixed(2)}</p>
                <p className="text-xs text-success">{pay.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2">
        <div className="cyber-panel p-6 h-full flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="text-accent" /> Validación con IA
          </h3>
          
          {!extractedData && !isProcessing && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                isDragging ? 'border-accent bg-accent/5 cyber-glow' : 'border-border bg-base'
              }`}
            >
              <UploadCloud size={48} className={isDragging ? 'text-accent' : 'text-sec'} />
              <p className="mt-4 font-medium text-main">Arrastra tu boleta de pago aquí</p>
              <p className="text-xs text-sec mt-2">JPG, PNG o PDF. La IA extraerá los datos.</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-accent font-mono animate-pulse">Procesando boleta mediante IA de Visión...</p>
            </div>
          )}

          {extractedData && !isProcessing && (
            <div className="flex-1 flex flex-col justify-center space-y-4 animate-fade-in">
              <div className="bg-success/10 border border-success/30 text-success p-3 rounded flex items-center gap-2">
                <CheckCircle size={18} /> Datos extraídos con éxito
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-sec">Nº de Operación</label>
                  <input type="text" defaultValue={extractedData.operation} className="w-full bg-base border border-border p-2 rounded text-main font-mono" />
                </div>
                <div>
                  <label className="text-xs text-sec">Monto Detectado</label>
                  <input type="text" defaultValue={extractedData.amount} className="w-full bg-base border border-border p-2 rounded text-main font-mono" />
                </div>
                <div>
                  <label className="text-xs text-sec">Fecha de Emisión</label>
                  <input type="text" defaultValue={extractedData.date} className="w-full bg-base border border-border p-2 rounded text-main font-mono" />
                </div>
              </div>
              <button 
                onClick={() => setExtractedData(null)}
                className="w-full py-3 bg-accent hover:bg-accent/80 text-white rounded font-medium mt-4 transition-colors cyber-glow"
              >
                Confirmar y Registrar Pago
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. System Audit View
const AuditView = () => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold border-b border-border pb-4 mb-6 text-accent flex items-center gap-3">
        <Terminal size={24} /> Log de Auditoría del Sistema
      </h2>
      <div className="cyber-panel bg-black flex-1 p-4 overflow-auto border-accent/20">
        <div className="font-mono text-xs space-y-2">
          <div className="text-sec pb-2 border-b border-border/30 mb-2">
            CONECTADO COMO: ADMIN_ROOT | DB: VANGUARD_PROD | TRACKING: SECURE
          </div>
          {SYSTEM_LOGS.map(log => (
            <div key={log.id_log} className="flex gap-4 hover:bg-white/5 p-1 rounded">
              <span className="text-sec w-36 shrink-0">{log.date}</span>
              <span className="text-warning w-32 shrink-0">[{log.user}]</span>
              <span className="text-success break-all">{log.action}</span>
            </div>
          ))}
          <div className="text-accent animate-pulse mt-4">_</div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP WRAPPER ---
export default function App() {
  const [role, setRole] = useState('STUDENT');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Auto-redirect if role changes and view is not allowed
  useEffect(() => {
    if (role === 'TEACHER' && currentView === 'finance') setCurrentView('dashboard');
    if (role !== 'ADMIN' && currentView === 'audit') setCurrentView('dashboard');
    if (role === 'ADMIN' && currentView === 'calendar') setCurrentView('dashboard');
  }, [role, currentView]);

  return (
    <AuthContext.Provider value={{ user: MOCK_USER, role, setRole }}>
      <DevRoleSwitcher />
      <div className="flex min-h-screen bg-base relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="flex-1 ml-64 p-8 relative z-10 h-screen overflow-auto">
          {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} setSelectedCourse={setSelectedCourse} />}
          {currentView === 'course' && selectedCourse && <CourseModuleView course={selectedCourse} setCurrentView={setCurrentView} />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'finance' && <FinanceView />}
          {currentView === 'audit' && <AuditView />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
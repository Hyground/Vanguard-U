import React, { useState, useMemo } from 'react';
import { 
  UserCog, Users, Plus, Edit3, Trash2, ShieldCheck, Mail, KeyRound, Contact2, Search, Filter, ChevronRight, X, CheckCircle2, UserPlus, Info
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export function AdminUserManagement() {
  const { users, people, createUser, updateUser, addPerson, updatePerson, addLog } = useData();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'people'
  const [isModalOpen, setIsSearchOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '', role: 'STUDENT', password: '', 
    firstName: '', lastName: '', email: '', personType: 'students',
    cui: '', personalCode: ''
  });

  const filteredUsers = useMemo(() => 
    users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())), 
    [users, searchQuery]
  );

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        username: item.username || '',
        role: item.role || 'STUDENT',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({ username: '', role: 'STUDENT', password: '', firstName: '', lastName: '', email: '', personType: 'students' });
    }
    setIsSearchOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateUser(editingItem.id, formData);
    } else {
      // 1. Crear Persona primero
      const personId = addPerson(formData.personType, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        personalCode: `VNG-${Math.floor(1000 + Math.random() * 9000)}`
      });
      // 2. Crear Usuario vinculado
      createUser({
        username: formData.username,
        role: formData.role,
        password: formData.password,
        personId
      });
    }
    setIsSearchOpen(false);
  };

  return (
    <div className="space-y-10 page-transition">
      
      {/* Header Premium */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">Acceso Nivel 0</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase italic opacity-60">Identity Manager v2.0</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main uppercase italic leading-none">
            Gestión de <span className="text-accent">Seguridad</span>
          </h2>
          <p className="text-sec text-lg font-medium italic">Control centralizado de identidades y vínculos relacionales.</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 transition-all active:scale-95 group"
        >
          <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
          Registrar Operador
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1.5 bg-card/40 premium-border rounded-2xl w-fit shadow-xl">
        <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-accent text-white shadow-lg' : 'text-sec hover:text-main'}`}>Directorio de Usuarios</button>
        <button onClick={() => setActiveTab('people')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'people' ? 'bg-accent text-white shadow-lg' : 'text-sec hover:text-main'}`}>Maestro de Personas</button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-sec" />
          <input 
            type="text" 
            placeholder="Buscar por identificador o nombre..." 
            className="w-full bg-card/40 border border-border/60 rounded-2xl py-4 pl-14 pr-6 text-main font-bold outline-none focus:border-accent transition-all placeholder:opacity-30"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-8 py-4 bg-card premium-border rounded-2xl text-sec flex items-center gap-3 hover:text-main hover:border-accent/40 transition-all font-black uppercase tracking-widest text-xs">
          <Filter size={18} /> Filtrar
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden premium-border shadow-2xl relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-black/20 border-b border-border/50">
                <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">ID Interno</th>
                <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Identidad</th>
                <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Rol Académico</th>
                <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em]">Estado</th>
                <th className="p-8 text-[10px] font-black text-sec uppercase tracking-[0.3em] text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {activeTab === 'users' ? filteredUsers.map(u => (
                <tr key={u.id} className="group hover:bg-accent/[0.02] transition-colors">
                  <td className="p-8 font-mono text-xs text-accent font-black tracking-tighter opacity-40">#00{u.id}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-base premium-border flex items-center justify-center font-black text-main shadow-inner group-hover:bg-accent/10 transition-colors">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-main uppercase italic tracking-tight">{u.username}</p>
                        <p className="text-[10px] text-sec font-medium mt-1">Person ID: {u.personId || 'No vinculado'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      u.role === 'TEACHER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-accent/10 text-accent border-accent/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${u.status ? 'bg-success shadow-[0_0_10px_#10B981]' : 'bg-sec'}`} />
                       <span className="text-[10px] font-bold text-sec uppercase tracking-widest">{u.status ? 'Activo' : 'Revocado'}</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-3 rounded-xl bg-card border border-border/60 text-sec hover:text-accent hover:border-accent/40 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button className="p-3 rounded-xl bg-card border border-border/60 text-sec hover:text-warning hover:border-warning/40 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                // Lógica de Personas (Students, Teachers)
                Object.keys(people).flatMap(type => people[type].map(p => (
                  <tr key={`${type}-${p.id}`} className="group hover:bg-accent/[0.02] transition-colors">
                    <td className="p-8 font-mono text-xs text-success font-black tracking-tighter opacity-40 italic">{type.slice(0,2).toUpperCase()}-{p.id}</td>
                    <td className="p-8">
                       <p className="text-sm font-black text-main uppercase italic">{p.firstName} {p.lastName}</p>
                       <p className="text-[10px] text-sec font-medium mt-1">{p.email}</p>
                    </td>
                    <td className="p-8">
                       <p className="text-[10px] font-black text-sec uppercase tracking-widest bg-base/50 px-3 py-1.5 rounded-lg border border-border w-fit">{type}</p>
                    </td>
                    <td className="p-8"><CheckCircle2 size={18} className="text-success opacity-40" /></td>
                    <td className="p-8 text-right">
                      <button className="p-3 rounded-xl bg-card border border-border/60 text-sec hover:text-accent transition-all opacity-0 group-hover:opacity-100"><Edit3 size={16}/></button>
                    </td>
                  </tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD MODAL PREMIUM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-2xl rounded-[3rem] premium-border p-12 relative animate-in zoom-in-95 duration-500 shadow-2xl">
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 p-3 rounded-2xl bg-base border border-border text-sec hover:text-main hover:rotate-90 transition-all duration-500">
              <X size={24} />
            </button>

            <header className="mb-10">
              <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.3em] text-xs mb-3">
                 <ShieldCheck size={18} /> Protocolo de Registro
              </div>
              <h4 className="text-4xl font-black text-main uppercase italic tracking-tighter">
                {editingItem ? 'Actualizar Identidad' : 'Nueva Credencial de Acceso'}
              </h4>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-2">Nombre de Usuario</label>
                     <div className="relative">
                        <UserCog size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sec" />
                        <input 
                          type="text" required
                          className="w-full bg-base border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-main outline-none focus:border-accent transition-all"
                          value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-sec uppercase tracking-widest ml-2">Nivel de Acceso (Rol)</label>
                     <select 
                       className="w-full bg-base border border-border/50 rounded-2xl py-4 px-6 text-sm font-bold text-main outline-none focus:border-accent appearance-none cursor-pointer"
                       value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                     >
                        <option value="STUDENT">Estudiante Regular</option>
                        <option value="TEACHER">Personal Docente</option>
                        <option value="ADMIN">Administrador Core</option>
                     </select>
                  </div>
               </div>

               {!editingItem && (
                 <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 text-accent border-b border-accent/20 pb-4">
                       <Contact2 size={18} />
                       <h5 className="font-black uppercase italic text-xs tracking-widest">Información Civil de la Persona</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <input type="text" placeholder="Nombres" required className="bg-base border border-border/50 rounded-xl py-3.5 px-5 text-sm font-medium outline-none focus:border-accent transition-all" onChange={e => setFormData({...formData, firstName: e.target.value})}/>
                       <input type="text" placeholder="Apellidos" required className="bg-base border border-border/50 rounded-xl py-3.5 px-5 text-sm font-medium outline-none focus:border-accent transition-all" onChange={e => setFormData({...formData, lastName: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                       <input type="email" placeholder="Correo Institucional" required className="bg-base border border-border/50 rounded-xl py-3.5 px-5 text-sm font-medium outline-none focus:border-accent transition-all" onChange={e => setFormData({...formData, email: e.target.value})}/>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-info/5 rounded-2xl text-[10px] font-bold text-sec uppercase">
                       <Info size={14} className="text-accent" />
                       Al crear un usuario, el sistema generará automáticamente un vínculo relacional en la base de datos de personas.
                    </div>
                 </div>
               )}

               <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-accent/20 transition-all active:scale-95">
                  Confirmar Transacción de Identidad
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

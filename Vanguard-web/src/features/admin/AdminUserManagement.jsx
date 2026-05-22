import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserCog, Users, Plus, Edit3, Trash2, ShieldCheck, Mail, KeyRound, Contact2, Search, Filter, ChevronRight, X, CheckCircle2, UserPlus, Info, Loader2, Link as LinkIcon, Zap
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export function AdminUserManagement() {
  const { users, people, createUser, updateUser, addPerson, updatePerson, addLog, isLoading, refreshData } = useData();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'people'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '', role: 'STUDENT', password: '', 
    firstName: '', lastName: '', email: '', personType: 'students',
    cui: '', personalCode: '', status: true, personId: ''
  });

  const filteredUsers = useMemo(() => 
    users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())), 
    [users, searchQuery]
  );

  const handleOpenModal = (item = null, type = 'user') => {
    if (item) {
      setEditingItem({ ...item, _type: type });
      setFormData({
        ...formData,
        ...item,
        personType: type === 'people' ? item._category : formData.personType,
        personId: item.personId || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ username: '', role: 'STUDENT', password: '', firstName: '', lastName: '', email: '', personType: 'students', status: true, personId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        if (editingItem._type === 'user') {
          await updateUser(editingItem.id, { username: formData.username, role: formData.role, status: formData.status, personId: formData.personId });
        } else {
          await updatePerson(editingItem._category, editingItem.id, { firstName: formData.firstName, lastName: formData.lastName, email: formData.email });
        }
      } else {
        let finalPersonId = formData.personId;
        
        // Si no hay personId, creamos una nueva persona
        if (!finalPersonId) {
          const personRes = await addPerson(formData.personType, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            personalCode: formData.personType === 'students' ? `VNG-${Math.floor(1000 + Math.random() * 9000)}` : undefined
          });
          finalPersonId = personRes.id || personRes.data?.id;
        }
        
        await createUser({
          username: formData.username,
          role: formData.role,
          password: formData.password,
          personId: finalPersonId
        });
      }
      setIsModalOpen(false);
      addLog('ADMIN', `OPERACIÓN DE IDENTIDAD EXITOSA`, 'success');
    } catch (err) {
      alert('Fallo en el protocolo: ' + err.message);
    }
  };

  return (
    <div className="space-y-12 page-transition">
      
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-border/50 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 rounded-[1.5rem] bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-2xl shadow-accent/5">
                <ShieldCheck size={32} strokeWidth={2.5} />
             </div>
             <div>
                <h2 className="text-6xl font-black tracking-tighter text-main uppercase italic leading-none">
                  Gestión <span className="text-accent">Sentinel</span>
                </h2>
                <p className="text-sec text-sm font-bold uppercase tracking-[0.4em] mt-2 opacity-60 italic">Identity & Access Management Protocol</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <button onClick={refreshData} className="p-5 rounded-2xl bg-card border border-border/60 text-sec hover:text-accent transition-all active:scale-95 shadow-xl">
              <Info size={24} className={isLoading ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={() => handleOpenModal()}
             className="bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-4 group"
           >
             <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
             Nuevo Registro Maestro
           </button>
        </div>
      </header>

      {/* Tabs Premium */}
      <div className="flex p-2 bg-card/40 backdrop-blur-xl premium-border rounded-[2.5rem] w-fit shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <button onClick={() => setActiveTab('users')} className={`px-12 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeTab === 'users' ? 'bg-accent text-white shadow-2xl shadow-accent/30' : 'text-sec hover:text-main hover:bg-white/5'}`}>Capa de Usuarios</button>
        <button onClick={() => setActiveTab('people')} className={`px-12 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeTab === 'people' ? 'bg-accent text-white shadow-2xl shadow-accent/30' : 'text-sec hover:text-main hover:bg-white/5'}`}>Capa de Personas</button>
      </div>

      {/* Main Table HD */}
      <div className="glass-panel rounded-[3.5rem] overflow-hidden premium-border shadow-[0_40px_120px_rgba(0,0,0,0.5)] relative bg-black/40">
        {isLoading && <div className="absolute inset-0 z-30 bg-base/60 backdrop-blur-md flex items-center justify-center"><Loader2 size={64} className="text-accent animate-spin" /></div>}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-black/60 border-b border-border/50">
                <th className="p-12 text-[11px] font-black text-sec uppercase tracking-[0.5em]">Identificador Único</th>
                <th className="p-12 text-[11px] font-black text-sec uppercase tracking-[0.5em]">Metadata de Identidad</th>
                <th className="p-12 text-[11px] font-black text-sec uppercase tracking-[0.5em]">Protocolo de Acceso</th>
                <th className="p-12 text-[11px] font-black text-sec uppercase tracking-[0.5em]">Status</th>
                <th className="p-12 text-[11px] font-black text-accent uppercase tracking-[0.5em] text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {activeTab === 'users' ? (
                filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-accent/[0.04] transition-all duration-500">
                    <td className="p-12 font-mono text-xs text-accent font-black tracking-tighter italic opacity-40">UUID-USR-{u.id}</td>
                    <td className="p-12">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[1.8rem] bg-base premium-border flex items-center justify-center font-black text-2xl text-main shadow-inner group-hover:scale-110 group-hover:rotate-2 transition-all duration-700">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-main uppercase italic tracking-tighter leading-none group-hover:text-accent transition-colors duration-500">{u.username}</p>
                          <p className="text-[10px] font-mono text-sec font-bold mt-2 opacity-50 uppercase tracking-widest flex items-center gap-2">
                             <LinkIcon size={12} className="text-accent" /> Rel: {u.personId || 'No vinculado'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-12">
                      <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-2xl ${
                        u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        u.role === 'TEACHER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-accent/10 text-accent border-accent/30 shadow-accent/5'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-12">
                      <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${u.status ? 'bg-emerald-500 shadow-[0_0_20px_#10B981]' : 'bg-sec/20'}`} />
                         <span className={`text-[11px] font-black uppercase tracking-widest ${u.status ? 'text-emerald-400' : 'text-sec opacity-30'}`}>{u.status ? 'Autorizado' : 'Inhabilitado'}</span>
                      </div>
                    </td>
                    <td className="p-12 text-right">
                      <div className="flex justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleOpenModal(u, 'user')} className="p-5 rounded-2xl bg-card border border-border/80 text-sec hover:text-accent hover:border-accent/50 transition-all shadow-2xl active:scale-90"><Edit3 size={20} strokeWidth={2.5}/></button>
                        <button className="p-5 rounded-2xl bg-card border border-border/80 text-sec hover:text-rose-500 hover:border-rose-500/50 transition-all shadow-2xl active:scale-90"><Trash2 size={20} strokeWidth={2.5}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                Object.keys(people).flatMap(cat => people[cat].map(p => (
                  <tr key={`${cat}-${p.id}`} className="group hover:bg-emerald-500/[0.03] transition-all duration-500">
                    <td className="p-12 font-mono text-xs text-emerald-500 font-black tracking-tighter italic opacity-40 uppercase">#{cat.slice(0,2)}-UUID-{p.id}</td>
                    <td className="p-12">
                       <div className="space-y-1">
                          <p className="text-2xl font-black text-main uppercase italic tracking-tighter leading-none group-hover:text-emerald-400 transition-colors duration-500">{p.firstName} {p.lastName}</p>
                          <p className="text-sm font-bold text-sec uppercase tracking-widest opacity-60 mt-2">{p.email}</p>
                       </div>
                    </td>
                    <td className="p-12">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                          <span className="text-xs font-black text-sec uppercase tracking-[0.3em] italic">{cat}</span>
                       </div>
                    </td>
                    <td className="p-12">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-xl">
                          <CheckCircle2 size={28} strokeWidth={3} />
                       </div>
                    </td>
                    <td className="p-12 text-right">
                       <button onClick={() => handleOpenModal({ ...p, _category: cat }, 'people')} className="p-5 rounded-2xl bg-card border border-border/80 text-sec hover:text-emerald-400 hover:border-emerald-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-2xl active:scale-90 translate-x-4 group-hover:translate-x-0 duration-500"><Edit3 size={20} strokeWidth={2.5}/></button>
                    </td>
                  </tr>
                )))
              )}
            </tbody>
          </table>
          {users.length === 0 && !isLoading && (
            <div className="p-40 text-center space-y-6 opacity-20">
               <ShieldCheck size={100} className="mx-auto" />
               <p className="text-2xl font-black uppercase tracking-[1em] italic">Database Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD Refactorizado HD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="glass-panel w-full max-w-4xl rounded-[4rem] premium-border p-20 relative animate-in zoom-in-95 duration-700 shadow-[0_80px_200px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-indigo-600 to-transparent shadow-[0_0_20px_#6366F1]" />
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 rounded-[2rem] bg-base border border-border text-sec hover:text-main hover:rotate-90 transition-all duration-700 shadow-2xl">
              <X size={32} strokeWidth={3} />
            </button>

            <header className="mb-16 space-y-4">
              <div className="flex items-center gap-4 text-accent font-black uppercase tracking-[0.6em] text-xs">
                 <Zap size={24} className="animate-pulse" /> Sentinel Transaction Protocol
              </div>
              <h4 className="text-7xl font-black text-main uppercase italic tracking-tighter leading-none">
                {editingItem ? 'Indexar <br/> Cambios' : 'Generar <br/> Credencial'}
              </h4>
            </header>

            <form onSubmit={handleSave} className="space-y-12">
               {(!editingItem || editingItem._type === 'user') && (
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <label className="text-xs font-black text-sec uppercase tracking-[0.3em] ml-4">Identificador Global (User)</label>
                       <div className="relative group">
                          <UserCog size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-sec group-focus-within:text-accent transition-colors" />
                          <input 
                            type="text" required
                            className="w-full bg-base/50 border border-border/60 rounded-[2rem] py-6 pl-16 pr-8 text-xl font-black text-main outline-none focus:border-accent focus:ring-[12px] focus:ring-accent/5 transition-all shadow-inner"
                            value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black text-sec uppercase tracking-[0.3em] ml-4">Capa de Autorización (Rol)</label>
                       <select 
                         className="w-full bg-base/50 border border-border/60 rounded-[2rem] py-6 px-10 text-xl font-black text-main outline-none focus:border-accent appearance-none cursor-pointer shadow-inner"
                         value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                       >
                          <option value="STUDENT">Estudiante Regular</option>
                          <option value="TEACHER">Personal Docente</option>
                          <option value="ADMIN">Administrador de Sistema</option>
                       </select>
                    </div>
                 </div>
               )}

               {(!editingItem || editingItem._type === 'people') && (
                 <div className="p-12 rounded-[3.5rem] bg-accent/[0.03] border border-accent/20 space-y-10 animate-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden group/box shadow-inner">
                    <div className="absolute top-0 right-0 p-12 text-accent/5 -rotate-12 transition-transform duration-[5s] group-hover/box:rotate-45"><Users size={300} /></div>
                    <div className="flex items-center gap-6 text-accent border-b border-accent/10 pb-8 relative z-10">
                       <Contact2 size={32} strokeWidth={2.5} />
                       <h5 className="text-xl font-black uppercase italic tracking-widest">Metadata de Persona Física</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-10 relative z-10">
                       <input type="text" placeholder="Nombres Civiles" required className="bg-base border border-border/60 rounded-[1.5rem] py-5 px-8 text-lg font-black text-main outline-none focus:border-accent transition-all shadow-xl" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}/>
                       <input type="text" placeholder="Apellidos Reales" required className="bg-base border border-border/60 rounded-[1.5rem] py-5 px-8 text-lg font-black text-main outline-none focus:border-accent transition-all shadow-xl" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}/>
                    </div>
                    <div className="relative z-10 group">
                       <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-sec" />
                       <input type="email" placeholder="Canal de Comunicación (Email)" required className="w-full bg-base border border-border/60 rounded-[1.5rem] py-5 pl-16 pr-8 text-lg font-black text-main outline-none focus:border-accent transition-all shadow-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                    </div>
                 </div>
               )}

               <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm shadow-[0_30px_70px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-6 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  {editingItem ? <ShieldCheck size={28} /> : <Zap size={28} className="group-hover:scale-125 transition-transform duration-500 animate-pulse" />}
                  <span className="relative z-10">Confirmar Operación en Caliente</span>
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

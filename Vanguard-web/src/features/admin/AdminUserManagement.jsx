import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Contact2,
  Edit3,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const tabs = [
  { id: 'users', label: 'Usuarios' },
  { id: 'students', label: 'Estudiantes' },
  { id: 'teachers', label: 'Docentes' },
  { id: 'tutors', label: 'Tutores' },
];

const defaultPagination = { page: 0, totalPages: 1, totalElements: 0 };

export function AdminUserManagement() {
  const {
    users,
    people,
    createUser,
    updateUser,
    addPerson,
    updatePerson,
    addLog,
    isLoading,
    securityPagination,
    refreshSecurityData,
  } = useData();

  const [activeTab, setActiveTab] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    role: 'STUDENT',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    personType: 'students',
    cui: '',
    personalCode: '',
    status: true,
    personId: '',
    userId: '',
  });

  const activePagination = securityPagination[activeTab] || defaultPagination;
  const usersPagination = securityPagination.users || defaultPagination;
  const userPage = usersPagination.page;
  const peoplePage = activeTab === 'users' ? 0 : activePagination.page;

  useEffect(() => {
    refreshSecurityData({ userPage: 0, peoplePage: 0, section: activeTab });
  }, [refreshSecurityData, activeTab]);

  const reloadCurrentPage = () => {
    refreshSecurityData({ userPage, peoplePage, section: activeTab });
  };

  const goUserPage = (nextPage) => {
    refreshSecurityData({ userPage: nextPage, peoplePage: 0, section: 'users' });
  };

  const goPeoplePage = (nextPage) => {
    refreshSecurityData({ userPage: 0, peoplePage: nextPage, section: activeTab });
  };

  const peopleRows = useMemo(() => (
    activeTab === 'users' ? [] : (people[activeTab] || []).map((person) => ({ ...person, _category: activeTab }))
  ), [people, activeTab]);

  const peopleByUserId = useMemo(() => {
    const index = new Map();
    peopleRows.forEach((person) => {
      if (person.userId !== null && person.userId !== undefined) {
        index.set(Number(person.userId), person);
      }
    });
    return index;
  }, [peopleRows]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchHint = activeTab === 'users'
    ? 'Filtra por usuario, rol o estado'
    : 'Filtra por nombre, correo, CUI o usuario vinculado';

  const filteredUsers = useMemo(() => (
    users.filter((user) => {
      const relation = peopleByUserId.get(Number(user.id));
      const statusText = user.status ? 'autorizado activo' : 'inhabilitado inactivo';
      const text = `${user.username} ${user.role} ${statusText} ${relation?.firstName || ''} ${relation?.lastName || ''}`.toLowerCase();
      return text.includes(normalizedSearch);
    })
  ), [users, peopleByUserId, normalizedSearch]);

  const filteredPeople = useMemo(() => (
    peopleRows.filter((person) => {
      const text = `${person.firstName} ${person.lastName} ${person.email || ''} ${person.cui || ''} ${person.userId || ''} ${person._category || ''}`.toLowerCase();
      return text.includes(normalizedSearch);
    })
  ), [peopleRows, normalizedSearch]);

  const visibleRows = activeTab === 'users' ? filteredUsers : filteredPeople;

  const handleOpenModal = (item = null, type = 'user') => {
    if (item) {
      setEditingItem({ ...item, _type: type });
      setFormData((current) => ({
        ...current,
        ...item,
        personType: type === 'people' ? item._category : current.personType,
        personId: item.personId || '',
        cui: item.cui || '',
        personalCode: item.personalCode || '',
        userId: item.userId || '',
      }));
    } else {
      setEditingItem(null);
      setFormData({
        username: '',
        role: activeTab === 'teachers' ? 'TEACHER' : 'STUDENT',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        personType: activeTab === 'users' ? 'students' : activeTab,
        status: true,
        personId: '',
        cui: '',
        personalCode: '',
        userId: '',
      });
    }
    setIsModalOpen(true);
  };

  const buildPersonPayload = (type, userId) => {
    const base = {
      cui: formData.cui,
      firstName: formData.firstName,
      lastName: formData.lastName,
      userId: Number(userId),
    };

    if (type === 'teachers') return { ...base, email: formData.email };
    if (type === 'students') {
      return {
        ...base,
        personalCode: formData.personalCode || `VNG-${Math.floor(1000 + Math.random() * 9000)}`,
        tutorId: formData.tutorId || null,
      };
    }
    return base;
  };

  const getUserRelationLabel = (userId) => {
    const relation = peopleByUserId.get(Number(userId));
    if (!relation) return 'Persona no cargada en esta vista';
    return `${relation._category} #${relation.id} - ${relation.firstName} ${relation.lastName}`;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      if (editingItem) {
        if (editingItem._type === 'user') {
          await updateUser(editingItem.id, { username: formData.username, role: formData.role, status: formData.status });
        } else {
          await updatePerson(editingItem._category, editingItem.id, buildPersonPayload(editingItem._category, formData.userId));
        }
      } else {
        const userRes = await createUser({
          username: formData.username,
          role: formData.role,
          password: formData.password,
        });
        const userId = userRes.idUser || userRes.id || userRes.data?.idUser;

        if (!userId) throw new Error('Usuario creado sin idUser en la respuesta');
        await addPerson(formData.personType, buildPersonPayload(formData.personType, userId));
      }

      setIsModalOpen(false);
      addLog('ADMIN', 'Operacion de identidad exitosa', 'success');
      reloadCurrentPage();
    } catch (err) {
      alert('No se pudo guardar: ' + err.message);
    }
  };

  return (
    <div className="page-transition h-[calc(100vh-8rem)] min-h-[42rem] flex flex-col gap-5 overflow-hidden">
      <header className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h2 className="text-3xl font-black tracking-tighter text-main uppercase italic leading-none">
              Seguridad <span className="text-accent">IAM</span>
            </h2>
            <p className="text-sec text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
              Usuarios, roles y personas vinculadas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reloadCurrentPage}
            className="h-10 w-10 rounded-lg bg-card border border-border/60 text-sec hover:text-accent transition-all active:scale-95 flex items-center justify-center"
            title="Actualizar datos"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal(null, activeTab === 'users' ? 'user' : 'people')}
            className="h-10 bg-accent hover:bg-accent/90 text-white px-4 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={15} />
            Nuevo registro
          </button>
        </div>
      </header>

      <section className="shrink-0 grid grid-cols-1 xl:grid-cols-[auto_1fr_auto] gap-3 items-center">
        <div className="flex flex-wrap gap-2 bg-card/60 premium-border rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-accent text-white shadow-md' : 'text-sec hover:text-main hover:bg-base/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-w-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchHint}
              className="security-search-input w-full h-10 border rounded-lg pl-9 pr-3 text-sm outline-none transition-all"
            />
          </div>
          <p className="mt-1 text-[10px] font-bold text-sec uppercase tracking-widest">
            {searchHint}
          </p>
        </div>

        <div className="flex items-center justify-between xl:justify-end gap-3 text-[10px] font-black text-sec uppercase tracking-widest">
          <span className="px-3 py-2 rounded-lg bg-card border border-border/60 whitespace-nowrap">
            {activePagination.totalElements} registros
          </span>
          <span className="px-3 py-2 rounded-lg bg-card border border-border/60 whitespace-nowrap">
            Pagina {activePagination.page + 1} / {activePagination.totalPages}
          </span>
        </div>
      </section>

      <section className="min-h-0 flex-1 glass-panel rounded-2xl overflow-hidden premium-border relative bg-card/60">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-base/60 backdrop-blur-md flex items-center justify-center">
            <Loader2 size={42} className="text-accent animate-spin" />
          </div>
        )}

        <div className="h-full overflow-auto">
          <table className="w-full min-w-[54rem] text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 bg-base shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
              <tr className="bg-base border-b border-border">
                <TableHead>Identidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {activeTab === 'users'
                ? visibleRows.map((user) => (
                    <UserRow key={user.id} user={user} relation={getUserRelationLabel(user.id)} onEdit={() => handleOpenModal(user, 'user')} />
                  ))
                : visibleRows.map((person) => (
                    <PersonRow key={`${person._category}-${person.id}`} person={person} onEdit={() => handleOpenModal(person, 'people')} />
                  ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && !isLoading && (
            <div className="h-full min-h-[20rem] flex flex-col items-center justify-center text-center text-sec/50 gap-3">
              <ShieldCheck size={48} />
              <p className="text-sm font-black uppercase tracking-widest">Sin registros para mostrar</p>
            </div>
          )}
        </div>
      </section>

      <footer className="shrink-0 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={(activeTab === 'users' ? userPage : peoplePage) === 0 || isLoading}
          onClick={() => (activeTab === 'users' ? goUserPage(userPage - 1) : goPeoplePage(peoplePage - 1))}
          className="px-4 py-2 rounded-lg bg-card border border-border/60 text-xs font-black text-sec disabled:opacity-30 hover:text-accent"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={(activeTab === 'users' ? userPage >= usersPagination.totalPages - 1 : peoplePage >= activePagination.totalPages - 1) || isLoading}
          onClick={() => (activeTab === 'users' ? goUserPage(userPage + 1) : goPeoplePage(peoplePage + 1))}
          className="px-4 py-2 rounded-lg bg-card border border-border/60 text-xs font-black text-sec disabled:opacity-30 hover:text-accent"
        >
          Siguiente
        </button>
      </footer>

      {isModalOpen && (
        <EditModal
          editingItem={editingItem}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TableHead({ children, align = 'left' }) {
  return (
    <th className={`px-5 py-3 border-b border-border bg-base text-[10px] font-black text-sec uppercase tracking-[0.18em] ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </th>
  );
}

function UserRow({ user, relation, onEdit }) {
  return (
    <tr className="group hover:bg-accent/[0.04] transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-base premium-border flex items-center justify-center font-black text-sm text-main">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-black text-main uppercase leading-none">Cuenta institucional</p>
            <p className="text-[10px] text-sec font-bold mt-1 flex items-center gap-1.5">
              <LinkIcon size={11} className="text-accent" /> {relation}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-black text-main uppercase leading-none">{user.username}</p>
        <p className="text-[10px] text-sec font-bold mt-1">Usuario de acceso</p>
      </td>
      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-5 py-4">
        <StatusBadge active={user.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <button type="button" onClick={onEdit} className="p-2 rounded-lg bg-card border border-border/80 text-sec hover:text-accent hover:border-accent/50 transition-all">
          <Edit3 size={16} />
        </button>
      </td>
    </tr>
  );
}

function PersonRow({ person, onEdit }) {
  return (
    <tr className="group hover:bg-success/[0.04] transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-base premium-border flex items-center justify-center font-black text-sm text-main">
            {(person.firstName?.[0] || 'P').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-main uppercase leading-none">{person.firstName} {person.lastName}</p>
            <p className="text-[10px] text-sec font-bold mt-1">{person.email || person.cui}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-black text-main uppercase leading-none">User {person.userId || '-'}</p>
        <p className="text-[10px] text-sec font-bold mt-1">Cuenta vinculada</p>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-[10px] font-black uppercase tracking-widest">
          {person._category}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 text-success border border-success/20">
          <CheckCircle2 size={17} />
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <button type="button" onClick={onEdit} className="p-2 rounded-lg bg-card border border-border/80 text-sec hover:text-success hover:border-success/50 transition-all">
          <Edit3 size={16} />
        </button>
      </td>
    </tr>
  );
}

function RoleBadge({ role }) {
  const classes = role === 'ADMIN'
    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    : role === 'TEACHER'
      ? 'bg-success/10 text-success border-success/20'
      : 'bg-accent/10 text-accent border-accent/20';

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${classes}`}>
      {role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${active ? 'text-success' : 'text-sec'}`}>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-success shadow-[0_0_10px_currentColor]' : 'bg-sec/30'}`} />
      {active ? 'Autorizado' : 'Inhabilitado'}
    </span>
  );
}

function EditModal({ editingItem, formData, setFormData, onClose, onSave }) {
  const showUserFields = !editingItem || editingItem._type === 'user';
  const showPersonFields = !editingItem || editingItem._type === 'people';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-2xl premium-border shadow-2xl overflow-hidden">
        <header className="h-16 px-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Gestion de identidad</p>
            <h4 className="text-xl font-black text-main uppercase italic leading-none">
              {editingItem ? 'Editar registro' : 'Nuevo registro'}
            </h4>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-base border border-border text-sec hover:text-main transition-all">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={onSave} className="max-h-[calc(90vh-4rem)] overflow-y-auto p-6 space-y-6">
          {showUserFields && (
            <section className="space-y-4">
              <SectionTitle icon={UserCog} title="Cuenta de acceso" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Usuario" icon={UserCog}>
                  <input required className="form-input" value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} />
                </Field>
                <Field label="Rol">
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(event) => setFormData({
                      ...formData,
                      role: event.target.value,
                      personType: event.target.value === 'TEACHER' ? 'teachers' : event.target.value === 'STUDENT' ? 'students' : formData.personType,
                    })}
                  >
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Docente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </Field>
                {!editingItem && (
                  <Field label="Clave temporal" icon={KeyRound}>
                    <input required type="password" className="form-input" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} />
                  </Field>
                )}
                {editingItem?._type === 'user' && (
                  <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-base/40 px-4 py-3 text-xs font-black text-sec uppercase tracking-widest">
                    <input type="checkbox" checked={Boolean(formData.status)} onChange={(event) => setFormData({ ...formData, status: event.target.checked })} />
                    Usuario autorizado
                  </label>
                )}
              </div>
            </section>
          )}

          {showPersonFields && (
            <section className="space-y-4">
              <SectionTitle icon={Contact2} title="Datos de persona" />
              {!editingItem && (
                <Field label="Tipo de persona">
                  <select className="form-input" value={formData.personType} onChange={(event) => setFormData({ ...formData, personType: event.target.value })}>
                    <option value="students">Estudiante</option>
                    <option value="teachers">Docente</option>
                    <option value="tutors">Tutor</option>
                  </select>
                </Field>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="CUI / DPI">
                  <input required minLength={13} maxLength={13} className="form-input" value={formData.cui} onChange={(event) => setFormData({ ...formData, cui: event.target.value })} />
                </Field>
                {formData.personType === 'students' && (
                  <Field label="Codigo personal">
                    <input className="form-input" value={formData.personalCode} onChange={(event) => setFormData({ ...formData, personalCode: event.target.value })} />
                  </Field>
                )}
                <Field label="Nombres">
                  <input required className="form-input" value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} />
                </Field>
                <Field label="Apellidos">
                  <input required className="form-input" value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} />
                </Field>
              </div>
              <Field label="Correo electronico" icon={Mail}>
                <input required type="email" className="form-input" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </Field>
            </section>
          )}

          <div className="flex justify-end gap-3 border-t border-border/50 pt-5">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-lg bg-card border border-border/60 text-xs font-black uppercase tracking-widest text-sec hover:text-main">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-3 rounded-lg bg-accent text-white text-xs font-black uppercase tracking-widest hover:bg-accent/90">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 text-accent">
      <Icon size={17} />
      <h5 className="text-xs font-black uppercase tracking-widest">{title}</h5>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-black text-sec uppercase tracking-widest">{label}</span>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sec" />}
        {React.cloneElement(children, {
          className: `${children.props.className || ''} ${Icon ? 'pl-9' : ''}`,
        })}
      </div>
    </label>
  );
}

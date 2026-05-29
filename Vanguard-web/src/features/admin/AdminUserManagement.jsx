import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Contact2,
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
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
const createLabels = {
  users: 'Nuevo usuario',
  students: 'Nuevo estudiante',
  teachers: 'Nuevo docente',
  tutors: 'Nuevo tutor',
};
const singularLabels = {
  users: 'usuario',
  students: 'estudiante',
  teachers: 'docente',
  tutors: 'tutor',
};
const roleByTab = {
  students: 'STUDENT',
  teachers: 'TEACHER',
  tutors: 'TUTOR',
};
const personTypeByRole = {
  STUDENT: 'students',
  TEACHER: 'teachers',
  TUTOR: 'tutors',
};
const roleLabels = {
  STUDENT: 'Estudiante',
  TEACHER: 'Docente',
  TUTOR: 'Tutor',
  ADMIN: 'Administrador',
};

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
  const [activeRequest, setActiveRequest] = useState(null);
  const [showTableLoader, setShowTableLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const pageDescription = 'Usuarios, roles y perfiles vinculados al sistema';
  const newButtonLabel = createLabels[activeTab] || 'Nuevo registro';

  const activePagination = securityPagination[activeTab] || defaultPagination;
  const usersPagination = securityPagination.users || defaultPagination;
  const userPage = usersPagination.page;
  const peoplePage = activeTab === 'users' ? 0 : activePagination.page;
  const lastRequestKey = useRef('');

  const loadIdentitySection = async ({ userPage: nextUserPage = 0, peoplePage: nextPeoplePage = 0, section = activeTab, force = false } = {}) => {
    const requestKey = `${section}:${nextUserPage}:${nextPeoplePage}`;
    if (!force && lastRequestKey.current === requestKey) return;

    lastRequestKey.current = requestKey;
    setActiveRequest(section);
    const loaderTimer = window.setTimeout(() => setShowTableLoader(true), 450);

    try {
      await refreshSecurityData({ userPage: nextUserPage, peoplePage: nextPeoplePage, section });
    } finally {
      window.clearTimeout(loaderTimer);
      setShowTableLoader(false);
      setActiveRequest(null);
    }
  };

  useEffect(() => {
    loadIdentitySection({ userPage: 0, peoplePage: 0, section: activeTab });
  }, [activeTab]);

  const reloadCurrentPage = () => {
    loadIdentitySection({ userPage, peoplePage, section: activeTab, force: true });
  };

  const goUserPage = (nextPage) => {
    loadIdentitySection({ userPage: nextPage, peoplePage: 0, section: 'users', force: true });
  };

  const goPeoplePage = (nextPage) => {
    loadIdentitySection({ userPage: 0, peoplePage: nextPage, section: activeTab, force: true });
  };

  const peopleRows = useMemo(() => (
    activeTab === 'users' ? [] : (people[activeTab] || []).map((person) => ({ ...person, _category: activeTab }))
  ), [people, activeTab]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchHint = activeTab === 'users'
    ? 'Buscar en esta pagina por usuario, rol o estado'
    : 'Buscar en esta pagina por nombre, correo, CUI o usuario';

  const filteredUsers = useMemo(() => (
    users.filter((user) => {
      const statusText = user.status ? 'autorizado activo' : 'inhabilitado inactivo';
      const text = `${user.username} ${user.role} ${statusText}`.toLowerCase();
      return text.includes(normalizedSearch);
    })
  ), [users, normalizedSearch]);

  const filteredPeople = useMemo(() => (
    peopleRows.filter((person) => {
      const text = `${person.firstName} ${person.lastName} ${person.email || ''} ${person.cui || ''} ${person.personalCode || ''} ${person.username || ''} ${person.role || ''} ${person._category || ''}`.toLowerCase();
      return text.includes(normalizedSearch);
    })
  ), [peopleRows, normalizedSearch]);

  const visibleRows = activeTab === 'users' ? filteredUsers : filteredPeople;
  const tableHeaders = activeTab === 'users'
    ? ['Usuario', 'Rol', 'Estado', 'Acciones']
    : ['Persona', 'Usuario', 'Perfil', 'Identificacion', 'Estado', 'Acciones'];

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
        role: roleByTab[activeTab] || 'STUDENT',
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
    setShowPassword(false);
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

  const handleSave = async (event) => {
    event.preventDefault();
    let saveStage = editingItem ? 'update' : 'user';
    try {
      if (editingItem) {
        if (editingItem._type === 'user') {
          await updateUser(editingItem.id, { username: formData.username, role: formData.role, status: formData.status });
        } else {
          await updatePerson(editingItem._category, editingItem.id, buildPersonPayload(editingItem._category, formData.userId));
        }
      } else {
        saveStage = 'user';
        const userRes = await createUser({
          username: formData.username,
          role: formData.role,
          password: formData.password,
        });
        const userId = userRes.idUser || userRes.id || userRes.data?.idUser;

        if (!userId) throw new Error('Usuario creado sin idUser en la respuesta');
        saveStage = 'profile';
        await addPerson(formData.personType, buildPersonPayload(formData.personType, userId));
      }

      setIsModalOpen(false);
      addLog('ADMIN', 'Operacion de identidad exitosa', 'success');
      loadIdentitySection({ userPage, peoplePage, section: activeTab, force: true });
      alert(editingItem ? 'Cambios guardados correctamente.' : `${capitalize(singularLabels[formData.personType] || 'registro')} creado correctamente.`);
    } catch (err) {
      alert(formatIdentityError(err, saveStage));
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
              Accesos <span className="text-accent">y Perfiles</span>
            </h2>
            <p className="text-sec text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
              {pageDescription}
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
            {newButtonLabel}
          </button>
        </div>
      </header>

      <section className="shrink-0 grid grid-cols-1 xl:grid-cols-[auto_1fr_auto] gap-3 items-center">
        <div className="flex flex-wrap gap-2 bg-card/60 premium-border rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
            key={tab.id}
            type="button"
              onClick={() => {
                if (activeTab !== tab.id) setActiveTab(tab.id);
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-accent text-white shadow-md' : 'text-sec hover:text-main hover:bg-base/70'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {activeRequest === tab.id && !showTableLoader && <Loader2 size={12} className="animate-spin" />}
              </span>
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
        {showTableLoader && (
          <div className="absolute inset-0 z-30 bg-base/60 backdrop-blur-md flex items-center justify-center">
            <Loader2 size={42} className="text-accent animate-spin" />
          </div>
        )}

        <div className="h-full overflow-auto">
          <table className="w-full min-w-[54rem] text-left border-collapse">
            <thead className="sticky top-0 z-30 bg-card shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
              <tr className="border-b border-border">
                {tableHeaders.map((header) => (
                  <TableHead key={header} align={header === 'Acciones' ? 'right' : 'left'}>{header}</TableHead>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'users'
                ? visibleRows.map((user) => (
                    <UserRow key={user.id} user={user} onEdit={() => handleOpenModal(user, 'user')} />
                  ))
                : visibleRows.map((person) => (
                    <PersonRow key={`${person._category}-${person.id}`} person={person} onEdit={() => handleOpenModal(person, 'people')} />
                  ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && !isLoading && !showTableLoader && (
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
          disabled={(activeTab === 'users' ? userPage : peoplePage) === 0 || Boolean(activeRequest)}
          onClick={() => (activeTab === 'users' ? goUserPage(userPage - 1) : goPeoplePage(peoplePage - 1))}
          className="px-4 py-2 rounded-lg bg-card border border-border/60 text-xs font-black text-sec disabled:opacity-30 hover:text-accent"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={(activeTab === 'users' ? userPage >= usersPagination.totalPages - 1 : peoplePage >= activePagination.totalPages - 1) || Boolean(activeRequest)}
          onClick={() => (activeTab === 'users' ? goUserPage(userPage + 1) : goPeoplePage(peoplePage + 1))}
          className="px-4 py-2 rounded-lg bg-card border border-border/60 text-xs font-black text-sec disabled:opacity-30 hover:text-accent"
        >
          Siguiente
        </button>
      </footer>

      {isModalOpen && (
        <EditModal
          activeTab={activeTab}
          editingItem={editingItem}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TableHead({ children, align = 'left' }) {
  return (
    <th className={`px-5 py-3 bg-card text-[10px] font-black text-sec uppercase tracking-[0.16em] ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </th>
  );
}

function UserRow({ user, onEdit }) {
  return (
    <tr className="group border-b border-border/45 hover:bg-base/60 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-main leading-none max-w-[18rem] truncate">{user.username}</p>
        <p className="text-[11px] text-sec font-medium mt-1">Cuenta de acceso</p>
      </td>
      <td className="px-5 py-3.5">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge active={user.status} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <button type="button" onClick={onEdit} className="p-2 rounded-lg bg-card border border-border/80 text-sec hover:text-accent hover:border-accent/50 transition-all">
          <Edit3 size={16} />
        </button>
      </td>
    </tr>
  );
}

function PersonRow({ person, onEdit }) {
  const profileLabel = singularLabels[person._category] || 'perfil';
  const profileTitle = capitalize(profileLabel);
  const supportingText = person._category === 'students'
    ? person.personalCode || person.cui
    : person.email || person.cui;
  const identifierMain = person.cui || 'Sin CUI';
  const identifierDetail = person._category === 'students'
    ? `Codigo ${person.personalCode || '-'}`
    : person.email || 'Documento de identidad';
  const hasUserId = Boolean(person.userId);
  const hasUser = Boolean(person.username);
  const accessLabel = !hasUser
    ? hasUserId ? 'Usuario no resuelto' : 'Sin usuario'
    : person.status === false ? 'Inhabilitado' : 'Con acceso';

  return (
    <tr className="group border-b border-border/45 hover:bg-base/60 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-main leading-none max-w-[18rem] truncate">{person.firstName} {person.lastName}</p>
        <p className="text-[11px] text-sec font-medium mt-1 truncate">{supportingText}</p>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-main leading-none max-w-[14rem] truncate">{person.username || (hasUserId ? `ID ${person.userId}` : 'Sin usuario')}</p>
        <p className="text-[11px] text-sec font-medium mt-1">{person.role ? roleLabels[person.role] || person.role : hasUserId ? 'Pendiente de resolver' : 'Acceso no asignado'}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm font-semibold text-main">{profileTitle}</span>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-bold text-main leading-none">{identifierMain}</p>
        <p className="text-[11px] text-sec font-medium mt-1">{identifierDetail}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className={`text-sm font-semibold ${hasUser && person.status !== false ? 'text-success' : 'text-sec'}`}>{accessLabel}</span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <button type="button" onClick={onEdit} className="p-2 rounded-lg bg-card border border-border/80 text-sec hover:text-success hover:border-success/50 transition-all">
          <Edit3 size={16} />
        </button>
      </td>
    </tr>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="text-sm font-semibold text-main">
      {roleLabels[role] || role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`text-sm font-semibold ${active ? 'text-success' : 'text-sec'}`}>
      {active ? 'Autorizado' : 'Inhabilitado'}
    </span>
  );
}

function capitalize(value) {
  const text = String(value || '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatIdentityError(error, saveStage) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('users_username_key') || message.includes('duplicate key') && message.includes('username')) {
    return 'Ese usuario ya existe. Usa otro nombre de usuario.';
  }
  if (message.includes('role not found')) {
    return 'No se encontro el rol seleccionado. Actualiza la pagina e intenta de nuevo.';
  }
  if (message.includes('username')) {
    return 'El usuario es obligatorio o no tiene un formato valido.';
  }
  if (message.includes('password')) {
    return 'La clave temporal es obligatoria.';
  }
  if (message.includes('cui') || message.includes('uk_tutor_cui') || message.includes('uk_students_cui')) {
    return saveStage === 'profile'
      ? 'La cuenta fue creada, pero el CUI ya existe en otro perfil. Revisa el perfil antes de intentar de nuevo.'
      : 'Ese CUI ya existe en otro registro.';
  }
  if (message.includes('personal_code') || message.includes('personalcode')) {
    return saveStage === 'profile'
      ? 'La cuenta fue creada, pero el codigo personal ya existe. Revisa el perfil antes de intentar de nuevo.'
      : 'Ese codigo personal ya existe.';
  }
  if (saveStage === 'profile') {
    return 'La cuenta fue creada, pero no se pudo crear el perfil vinculado. Revisa CUI, codigo personal y datos requeridos.';
  }
  return 'No se pudo guardar el registro. Revisa los datos e intenta de nuevo.';
}

function EditModal({ activeTab, editingItem, formData, setFormData, showPassword, setShowPassword, onClose, onSave }) {
  const showUserFields = !editingItem || editingItem._type === 'user';
  const showPersonFields = !editingItem || editingItem._type === 'people';
  const isFixedProfileCreation = !editingItem && activeTab !== 'users';
  const recordLabel = editingItem?._type === 'user'
    ? 'usuario'
    : singularLabels[formData.personType] || singularLabels[activeTab] || 'registro';
  const currentPersonType = formData.personType || activeTab;
  const needsEmail = currentPersonType === 'teachers';
  const needsPersonalCode = currentPersonType === 'students';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-2xl premium-border shadow-2xl overflow-hidden">
        <header className="h-16 px-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Accesos y perfiles</p>
            <h4 className="text-xl font-black text-main uppercase italic leading-none">
              {editingItem ? `Editar ${recordLabel}` : `Nuevo ${recordLabel}`}
            </h4>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-base border border-border text-sec hover:text-main transition-all">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={onSave} className="max-h-[calc(90vh-4rem)] overflow-y-auto p-6 space-y-6">
          {showUserFields && (
            <section className="space-y-4">
              <SectionTitle icon={UserCog} title={`Acceso del ${recordLabel}`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Usuario" icon={UserCog}>
                  <input required className="form-input" value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} />
                </Field>
                {isFixedProfileCreation ? (
                  <Field label="Rol">
                    <div className="form-input flex items-center text-sm font-black uppercase tracking-widest text-main">
                      {roleLabels[formData.role] || formData.role}
                    </div>
                  </Field>
                ) : (
                  <Field label="Rol">
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(event) => setFormData({
                        ...formData,
                        role: event.target.value,
                        personType: personTypeByRole[event.target.value] || formData.personType,
                      })}
                    >
                      <option value="STUDENT">Estudiante</option>
                      <option value="TEACHER">Docente</option>
                      <option value="TUTOR">Tutor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </Field>
                )}
                {!editingItem && (
                  <Field
                    label="Clave temporal"
                    icon={KeyRound}
                    action={(
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-sec hover:text-accent transition-colors"
                        aria-label={showPassword ? 'Ocultar clave temporal' : 'Mostrar clave temporal'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  >
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      className="form-input has-trailing-action"
                      value={formData.password}
                      onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                      autoComplete="new-password"
                    />
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
              <SectionTitle icon={Contact2} title={`Datos de ${recordLabel}`} />
              {!editingItem && activeTab === 'users' && (
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
                {needsPersonalCode && (
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
              {needsEmail && (
                <Field label="Correo electronico" icon={Mail}>
                  <input type="email" className="form-input" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                </Field>
              )}
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

function Field({ label, icon: Icon, action, children }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-black text-sec uppercase tracking-widest">{label}</span>
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sec" />}
        {React.cloneElement(children, {
          className: `${children.props.className || ''} ${Icon ? 'has-leading-icon' : ''}`,
        })}
        {action}
      </div>
    </label>
  );
}

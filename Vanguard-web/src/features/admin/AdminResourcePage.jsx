import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCcw, Plus, Search, Filter, AlertTriangle, X, Save, Loader2, Edit3, Trash2 } from 'lucide-react';
import { adminResources, getResourceById, listResource, updateUserStatus, createResource, updateResource, deleteResource } from '../../api/adminApi';
import { asList, getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';

const referenceCache = {};

export function AdminResourcePage({ group }) {
  const { token } = useAuth();
  const resources = useMemo(() => adminResources.filter((res) => res.group === group), [group]);
  const [activeId, setActiveId] = useState(resources[0]?.id);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [references, setReferences] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const activeResource = resources.find((res) => res.id === activeId);

  const loadRows = async (targetPage = 0) => {
    if (!activeResource) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await listResource(activeResource, token, targetPage);
      const nextRows = asList(response);

      const totalP = response?.totalPages ?? response?.data?.totalPages ?? 1;
      const totalE = response?.totalElements ?? response?.data?.totalElements ?? nextRows.length;

      setRows(nextRows);
      setPage(targetPage);
      setTotalPages(totalP);
      setTotalElements(totalE);
      setReferences(await loadReferences(activeResource, nextRows, token));
    } catch (err) {
      setRows([]);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferences = async (resource, nextRows, authToken) => {
    const refColumns = resource.columns.filter((col) => col.type === 'ref');
    if (refColumns.length === 0 || nextRows.length === 0) return {};

    const entries = await Promise.all(
      refColumns.map(async (col) => {
        const ids = [...new Set(nextRows.map((row) => row[col.key]).filter(Boolean))];
        const missingIds = ids.filter((id) => !referenceCache[`${col.ref}:${id}`]);

        if (missingIds.length > 0) {
          const results = await Promise.allSettled(missingIds.map((id) => getResourceById(col.ref, id, authToken)));
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value) {
              referenceCache[`${col.ref}:${missingIds[idx]}`] = getReferenceLabel(res.value);
            }
          });
        }

        const map = {};
        ids.forEach((id) => { map[id] = referenceCache[`${col.ref}:${id}`]; });
        return [col.ref, map];
      }),
    );
    return Object.fromEntries(entries);
  };

  useEffect(() => {
    setActiveId(resources[0]?.id);
    setPage(0);
  }, [resources]);

  useEffect(() => {
    loadRows(page);
  }, [activeId, token]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm('¿Está seguro de eliminar este registro? Esta acción es irreversible.')) return;
    
    try {
      const id = item.id || item.idUser || item.idMethod;
      await deleteResource(activeResource.id, id, token);
      await loadRows(page);
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateResource(activeResource.id, editingItem.id || editingItem.idUser || editingItem.idMethod, formData, token);
      } else {
        await createResource(activeResource.id, formData, token);
      }
      setIsModalOpen(false);
      await loadRows(page);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resourceActions = (row) => (
    <div className="flex justify-end gap-3">
      {activeResource.id === 'users' && (
        <button
          type="button"
          onClick={async () => {
            await updateUserStatus(row.id, !row.status, token);
            await loadRows(page);
          }}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
            row.status ? 'border-warning/30 text-warning hover:bg-warning/10' : 'border-success/30 text-success hover:bg-success/10'
          }`}
        >
          {row.status ? 'Revocar' : 'Autorizar'}
        </button>
      )}
      <button 
        onClick={() => handleOpenModal(row)}
        className="p-2 rounded-lg bg-card border border-border/60 text-sec hover:text-accent transition-all"
      >
        <Edit3 size={14} />
      </button>
      <button 
        onClick={() => handleDelete(row)}
        className="p-2 rounded-lg bg-card border border-border/60 text-sec hover:text-rose-500 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  if (!activeResource) return <EmptyState title="Modulo sin recursos" description="No hay recursos configurados." />;

  return (
    <section className="space-y-8 page-transition">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-black tracking-widest uppercase border border-accent/20">{group}</span>
            <span className="h-px w-6 bg-border/50" />
            <span className="text-sec text-[9px] font-mono tracking-tighter uppercase italic opacity-60">Gestión de Recursos</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-main uppercase italic leading-none">{activeResource.title}</h2>
          <p className="text-sec text-sm font-medium opacity-80">Gestión de registros institucionales con sincronización atómica.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 transition-all active:scale-95"
          >
            <Plus size={14} /> Nuevo Registro
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {resources.map((res) => (
          <button
            key={res.id}
            onClick={() => setActiveId(res.id)}
            className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
              activeId === res.id 
                ? 'bg-accent border-accent text-white shadow-lg' 
                : 'bg-card border-border/60 text-sec hover:text-main hover:border-accent/40'
            }`}
          >
            {res.title}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden premium-border shadow-[0_20px_60px_rgba(15,23,42,0.12)] relative bg-card/70">
        {isLoading && <div className="absolute inset-0 z-20 bg-base/60 backdrop-blur-sm flex items-center justify-center"><Loader2 size={48} className="text-accent animate-spin" /></div>}
        <div className="bg-card/30">
          <DataTable columns={activeResource.columns} rows={rows} actions={resourceActions} references={references} />
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4 text-[9px] font-black text-sec uppercase tracking-[0.2em]">
           <div className="px-4 py-2 rounded-lg bg-card premium-border"><span className="text-emerald-400">{totalElements}</span> Registros Totales</div>
           <div className="px-4 py-2 rounded-lg bg-card premium-border">Página <span className="text-accent">{page + 1}</span> de {totalPages}</div>
        </div>
        <div className="flex items-center bg-card/60 premium-border rounded-xl p-1 shadow-xl backdrop-blur-xl">
           <button disabled={page === 0 || isLoading} onClick={() => loadRows(page - 1)} className="p-3 rounded-lg hover:bg-white/5 disabled:opacity-20 text-sec hover:text-accent transition-all"><ChevronLeft size={18} strokeWidth={3}/></button>
           <div className="w-px h-6 bg-border/40 mx-1" />
           <button disabled={page >= totalPages - 1 || isLoading} onClick={() => loadRows(page + 1)} className="p-3 rounded-lg hover:bg-white/5 disabled:opacity-20 text-sec hover:text-accent transition-all"><ChevronRight size={18} strokeWidth={3}/></button>
        </div>
      </div>

      {/* CRUD Modal HD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg rounded-[2.5rem] premium-border p-10 relative animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-indigo-600 to-transparent" />
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 rounded-xl bg-base border border-border text-sec hover:text-main hover:rotate-90 transition-all duration-500 shadow-xl">
              <X size={20} strokeWidth={3} />
            </button>

            <header className="mb-8 space-y-2">
              <div className="flex items-center gap-2.5 text-accent font-black uppercase tracking-[0.4em] text-[9px]">
                 <Save size={14} /> Protocolo de Transacción
              </div>
              <h4 className="text-3xl font-black text-main uppercase italic tracking-tighter">
                {editingItem ? 'Indexar Cambios' : 'Nuevo Registro'}
              </h4>
              <p className="text-sec text-[10px] font-bold uppercase opacity-40 italic">{activeResource.title} Master Record</p>
            </header>

            <form onSubmit={handleSave} className="space-y-6">
               <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                  {activeResource.columns.filter(c => c.key !== 'id' && c.key !== 'status').map(col => (
                    <div key={col.key} className="space-y-2">
                       <label className="text-[9px] font-black text-sec uppercase tracking-widest ml-2">{col.label}</label>
                       <input 
                         type={col.type === 'date' ? 'date' : 'text'}
                         required
                         className="w-full bg-base border border-border/60 rounded-xl py-3 px-5 text-sm font-bold text-main outline-none focus:border-accent transition-all shadow-inner"
                         value={formData[col.key] || ''}
                         onChange={e => setFormData({ ...formData, [col.key]: e.target.value })}
                         placeholder={`Ingrese ${col.label.toLowerCase()}...`}
                       />
                    </div>
                  ))}
               </div>

               <button 
                 type="submit" 
                 disabled={isSaving}
                 className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-accent/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
               >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                  Confirmar Operación
               </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function getReferenceLabel(item) {
  if (item.firstName || item.lastName) return [item.firstName, item.lastName].filter(Boolean).join(' ');
  if (item.code && item.name) return `${item.code} - ${item.name}`;
  if (item.name) return item.name;
  if (item.code) return item.code;
  if (item.year) return String(item.year);
  if (item.methodName) return item.methodName;
  if (item.username) return item.username;
  return `#${item.id ?? item.idMethod ?? ''}`;
}

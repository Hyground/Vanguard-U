import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCcw, Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { adminResources, getResourceById, listResource, updateUserStatus } from '../../api/adminApi';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const userActions = activeResource?.id === 'users' ? (row) => (
    <button
      type="button"
      onClick={async () => {
        try {
          await updateUserStatus(row.id, !row.status, token);
          await loadRows(page);
        } catch(e) {
          alert('Error al actualizar estado: ' + e.message);
        }
      }}
      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
        row.status 
          ? 'border-warning/30 text-warning hover:bg-warning/10' 
          : 'border-success/30 text-success hover:bg-success/10'
      }`}
    >
      {row.status ? 'Desactivar' : 'Activar'}
    </button>
  ) : null;

  if (!activeResource) return <EmptyState title="Modulo sin recursos" description="No hay recursos configurados." />;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/20">{group}</span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase">Resource Manager</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-main italic uppercase">{activeResource.title}</h2>
          <p className="text-sm text-sec mt-2 max-w-md">Gestión centralizada de registros institucionales con integridad referencial.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRows(page)}
            className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-xs font-bold text-sec hover:text-main hover:border-accent/50 transition-all active:scale-95"
          >
            <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            Sincronizar
          </button>
          <button className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-accent/20 transition-all active:scale-95">
            <Plus size={14} />
            Nuevo Registro
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {resources.map((res) => (
          <button
            key={res.id}
            onClick={() => setActiveId(res.id)}
            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              activeId === res.id 
                ? 'bg-accent border-accent text-white shadow-lg' 
                : 'bg-card border-border text-sec hover:text-main hover:border-accent/40'
            }`}
          >
            {res.title}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="cyber-panel overflow-hidden border-none shadow-2xl">
          <div className="bg-black/20 backdrop-blur-md">
            {isLoading ? (
              <div className="py-32 text-center space-y-4">
                <div className="inline-block w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sec text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Indexando registros...</p>
              </div>
            ) : (
              <DataTable columns={activeResource.columns} rows={rows} actions={userActions} references={references} />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2 py-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-sec uppercase tracking-widest">
            <div className="px-3 py-2 rounded-lg bg-card border border-border">
              <span className="text-success">{totalElements}</span> Registros totales
            </div>
            <div className="px-3 py-2 rounded-lg bg-card border border-border">
              Página <span className="text-accent">{page + 1}</span> de {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 shadow-lg">
            <button
              disabled={page === 0 || isLoading}
              onClick={() => loadRows(page - 1)}
              className="p-2.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-sec transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="h-6 w-px bg-border/50" />
            <button
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => loadRows(page + 1)}
              className="p-2.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-sec transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="cyber-panel p-4 bg-warning/5 border-warning/20 flex items-center gap-4 text-warning">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
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

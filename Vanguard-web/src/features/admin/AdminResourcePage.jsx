import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { adminResources, getResourceById, listResource, updateUserStatus } from '../../api/adminApi';
import { asList, getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';

// Cache simple para evitar peticiones repetidas a los mismos recursos/ids
const referenceCache = {};

export function AdminResourcePage({ group }) {
  const { token } = useAuth();
  const resources = useMemo(() => adminResources.filter((resource) => resource.group === group), [group]);
  const [activeId, setActiveId] = useState(resources[0]?.id);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [references, setReferences] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const activeResource = resources.find((resource) => resource.id === activeId);

  const loadRows = async (targetPage = 0) => {
    if (!activeResource) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await listResource(activeResource, token, targetPage);
      const nextRows = asList(response);

      // Metadatos de paginacion (Spring style)
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
    const refColumns = resource.columns.filter((column) => column.type === 'ref');
    if (refColumns.length === 0 || nextRows.length === 0) return {};

    const entries = await Promise.all(
      refColumns.map(async (column) => {
        const ids = [...new Set(nextRows.map((row) => row[column.key]).filter(Boolean))];

        // Filtrar IDs que ya estan en cache
        const missingIds = ids.filter((id) => !referenceCache[`${column.ref}:${id}`]);

        if (missingIds.length > 0) {
          const results = await Promise.allSettled(missingIds.map((id) => getResourceById(column.ref, id, authToken)));
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              referenceCache[`${column.ref}:${missingIds[index]}`] = getReferenceLabel(result.value);
            }
          });
        }

        const map = {};
        ids.forEach((id) => {
          map[id] = referenceCache[`${column.ref}:${id}`];
        });

        return [column.ref, map];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, token]);

  const userActions =
    activeResource?.id === 'users'
      ? (row) => (
          <button
            type="button"
            onClick={async () => {
              await updateUserStatus(row.id, !row.status, token);
              await loadRows(page);
            }}
            className="text-xs px-3 py-1 rounded border border-border text-sec hover:text-main hover:border-accent/40"
          >
            {row.status ? 'Desactivar' : 'Activar'}
          </button>
        )
      : null;

  if (!activeResource) {
    return <EmptyState title="Modulo sin recursos" description="No hay endpoints configurados para esta seccion." />;
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold tracking-widest uppercase border border-accent/20">
              {group}
            </span>
            <span className="h-px w-8 bg-border/50" />
            <span className="text-sec text-[10px] font-mono tracking-tighter uppercase">
              Infraestructura v1.0
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-main">{activeResource.title}</h2>
          <p className="text-sm text-sec mt-1 max-w-md">
            Gestion y supervisión de registros institucionales sincronizados con el nucleo académico.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadRows(page)}
          className="flex items-center gap-2 self-start md:self-end rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-sec hover:text-main hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </header>

      <div className="flex flex-wrap gap-2 py-1">
        {resources.map((resource) => (
          <button
            key={resource.id}
            type="button"
            onClick={() => setActiveId(resource.id)}
            className={`relative rounded-full px-5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 border ${
              activeId === resource.id
                ? 'border-accent bg-accent text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'border-border text-sec hover:text-main hover:border-accent/40 bg-card'
            }`}
          >
            {resource.title}
            {activeId === resource.id && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="border border-warning/30 bg-warning/5 text-warning rounded-xl p-4 text-sm flex items-center gap-3 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="cyber-panel overflow-hidden border-none shadow-2xl">
          <div className="bg-black/20 backdrop-blur-md p-1">
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sec text-sm font-medium animate-pulse tracking-widest uppercase">Consultando base de datos...</p>
              </div>
            ) : (
              <DataTable columns={activeResource.columns} rows={rows} actions={userActions} references={references} />
            )}
          </div>
        </div>

        {/* Footer con Paginación - Ubicación Orgánica */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
          <div className="flex items-center gap-4 text-xs text-sec font-medium order-2 sm:order-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>{totalElements} registros totales</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <span className="font-mono">Página {page + 1} de {totalPages}</span>
          </div>

          <div className="flex items-center bg-card border border-border rounded-xl p-1.5 shadow-lg order-1 sm:order-2">
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => loadRows(page - 1)}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-all text-sec hover:text-accent"
              title="Página anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="h-6 w-px bg-border/50 mx-1" />
            
            <button
              type="button"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => loadRows(page + 1)}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-all text-sec hover:text-accent"
              title="Página siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
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

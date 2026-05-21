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
    <section className="space-y-5">
      <header className="border-b border-border pb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-accent font-mono">{group.toUpperCase()}</p>
          <h2 className="text-2xl font-bold mt-1">{activeResource.title}</h2>
          <p className="text-sm text-sec mt-2">Gestion y visualizacion de registros institucionales.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] uppercase tracking-wider text-sec mb-1">
              Total: <span className="text-main font-mono">{totalElements}</span> registros
            </span>
            <div className="flex items-center bg-card border border-border rounded-lg p-1">
              <button
                type="button"
                disabled={page === 0 || isLoading}
                onClick={() => loadRows(page - 1)}
                className="p-1.5 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 text-xs font-mono text-sec">
                Pag. {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1 || isLoading}
                onClick={() => loadRows(page + 1)}
                className="p-1.5 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadRows(page)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-sec hover:text-main hover:border-accent/40"
          >
            <RefreshCcw size={16} />
            Actualizar
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {resources.map((resource) => (
          <button
            key={resource.id}
            type="button"
            onClick={() => setActiveId(resource.id)}
            className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
              activeId === resource.id
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border text-sec hover:text-main hover:border-accent/30'
            }`}
          >
            {resource.title}
          </button>
        ))}
      </div>

      {error && <div className="border border-warning/30 bg-warning/10 text-warning rounded-lg p-3 text-sm">{error}</div>}

      <div className="cyber-panel p-4">
        {isLoading ? (
          <div className="py-12 text-center text-sec">Cargando registros...</div>
        ) : (
          <DataTable columns={activeResource.columns} rows={rows} actions={userActions} references={references} />
        )}
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

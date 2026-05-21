import React from 'react';

function formatValue(value, column, references = {}) {
  if (value === null || value === undefined || value === '') return '-';
  if (column.type === 'ref') return references[column.ref]?.[value] || `#${value}`;
  if (column.type === 'boolean') return value ? 'Activo' : 'Inactivo';
  if (column.type === 'date') return String(value).replace('T', ' ').slice(0, 16);
  return String(value);
}

export function DataTable({ columns, rows, actions, references }) {
  return (
    <div className="overflow-auto custom-scrollbar">
      <table className="w-full min-w-[50rem] text-left border-separate border-spacing-0">
        <thead>
          <tr className="text-sec text-[10px] uppercase tracking-[0.2em] font-bold">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4 border-b border-border/30 bg-black/40 sticky top-0 z-10">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 border-b border-border/30 bg-black/40 sticky top-0 z-10 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {rows.map((row, index) => (
            <tr 
              key={row.id ?? row.idUser ?? row.idRole ?? index} 
              className="group hover:bg-accent/[0.03] transition-colors duration-150"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-sm font-medium text-main/90 group-hover:text-main">
                  {formatValue(row[column.key], column, references)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right opacity-60 group-hover:opacity-100 transition-opacity">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-sec/40">
                    <span className="text-xl">!</span>
                  </div>
                  <p className="text-sm text-sec font-medium">No se encontraron registros en esta vista.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className="overflow-auto border border-border rounded-lg">
      <table className="w-full min-w-[44rem] text-left border-collapse">
        <thead className="bg-base">
          <tr className="border-b border-border text-sec text-xs uppercase tracking-wider">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 font-semibold text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.idUser ?? row.idRole ?? index} className="border-b border-border/60 hover:bg-white/5">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm">
                  {formatValue(row[column.key], column, references)}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-sm text-sec">
                No hay registros para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

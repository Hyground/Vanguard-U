import React from 'react';

function formatValue(value, column, references = {}) {
  if (value === null || value === undefined || value === '') return '-';
  
  if (column.type === 'ref') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-border/50 text-[10px] font-mono text-accent">
        {references[column.ref]?.[value] || `#${value}`}
      </span>
    );
  }

  if (column.type === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        value ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
      }`}>
        <div className={`w-1 h-1 rounded-full ${value ? 'bg-success' : 'bg-warning'}`} />
        {value ? 'Activo' : 'Inactivo'}
      </span>
    );
  }

  if (column.type === 'date') {
    return (
      <span className="text-sec font-medium">
        {String(value).replace('T', ' ').slice(0, 16)}
      </span>
    );
  }

  return <span className="text-main/80 font-medium">{String(value)}</span>;
}

export function DataTable({ columns, rows, actions, references }) {
  return (
    <div className="overflow-auto custom-scrollbar">
      <table className="w-full min-w-[50rem] text-left border-separate border-spacing-0">
        <thead>
          <tr className="text-sec text-[10px] uppercase tracking-[0.2em] font-black">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-5 border-b border-border/30 bg-black/40 sticky top-0 z-10">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-6 py-5 border-b border-border/30 bg-black/40 sticky top-0 z-10 text-right">Comandos</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 bg-card/10">
          {rows.map((row, index) => (
            <tr 
              key={row.id ?? row.idUser ?? row.idRole ?? index} 
              className="group hover:bg-accent/[0.04] transition-all duration-200"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 border-b border-border/10">
                  {formatValue(row[column.key], column, references)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 border-b border-border/10 text-right">
                  <div className="flex justify-end opacity-40 group-hover:opacity-100 transition-all duration-300">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <div className="w-12 h-12 rounded-2xl bg-border/20 flex items-center justify-center text-sec">
                    <span className="text-2xl font-black">?</span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Cero registros detectados</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

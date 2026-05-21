import React from 'react';

export function StatCard({ label, value, icon: Icon, error }) {
  return (
    <div className="cyber-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-sec">{label}</p>
          <p className="text-3xl font-bold mt-2">{value ?? '-'}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded bg-accent/10 text-accent flex items-center justify-center">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-warning mt-3">{error}</p>}
    </div>
  );
}

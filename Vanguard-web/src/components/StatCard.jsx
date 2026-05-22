import React from 'react';

export function StatCard({ label, value, icon: Icon, error, color = 'accent' }) {
  const colorClasses = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };

  return (
    <div className={`cyber-panel p-6 group hover:border-accent/40 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-sec uppercase tracking-[0.2em]">{label}</p>
          <p className="text-4xl font-black text-main tracking-tighter">
            {value !== null ? value : <span className="animate-pulse opacity-20">...</span>}
          </p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${colorClasses[color] || colorClasses.accent} border`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {error ? (
        <div className="mt-4 flex items-center gap-2 text-[10px] text-warning font-bold uppercase tracking-wider bg-warning/5 p-2 rounded-lg border border-warning/20">
          <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          Offline: {error}
        </div>
      ) : (
        <div className="mt-4 h-1 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent/30 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
        </div>
      )}
    </div>
  );
}

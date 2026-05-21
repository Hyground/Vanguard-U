import React from 'react';
import { AlertCircle } from 'lucide-react';

export function EmptyState({ title, description }) {
  return (
    <div className="cyber-panel p-8 text-center">
      <AlertCircle className="mx-auto text-sec mb-3" size={28} />
      <h3 className="font-semibold text-main">{title}</h3>
      {description && <p className="text-sm text-sec mt-2">{description}</p>}
    </div>
  );
}

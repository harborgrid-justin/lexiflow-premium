import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error';
}

export function StatCard({ label, value, icon, status }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[var(--color-text-muted)] opacity-70">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${status === 'success' ? 'text-green-500' :
          status === 'warning' ? 'text-amber-500' :
            status === 'error' ? 'text-red-500' :
              'text-[var(--color-text)]'
        }`}>
        {value}
      </div>
    </div>
  );
}

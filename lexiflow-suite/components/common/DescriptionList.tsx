
import React from 'react';

interface DescriptionItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const DescriptionList: React.FC<{ children: React.ReactNode; className?: string; cols?: number }> = ({ children, className = '', cols = 2 }) => {
  const gridCols = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 md:grid-cols-2' : cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {children}
    </div>
  );
};

export const DescriptionItem: React.FC<DescriptionItemProps> = ({ label, value, className = '' }) => (
  <div className={className}>
    <dt className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</dt>
    <dd className="text-sm font-medium text-slate-900 break-words">{value}</dd>
  </div>
);

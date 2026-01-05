
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pb-1">
          {actions}
        </div>
      )}
    </div>
  );
};

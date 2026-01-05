
import React from 'react';

export const ComponentLabel = ({ id, name }: { id: string; name: string }) => (
  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-1">
    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide truncate pr-2">{name}</span>
    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">{id}</span>
  </div>
);

export const DemoContainer = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col ${className}`}>
    {children}
  </div>
);

export const SectionHeading = ({ title, icon: Icon, count }: { title: string; icon: any; count: string }) => (
    <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center">
            <Icon className="mr-3 text-blue-600 h-6 w-6"/> {title}
        </h3>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{count} Components</span>
    </div>
);

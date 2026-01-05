
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <Home className="h-3 w-3 mr-1 text-slate-400" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-3 w-3 mx-1 text-slate-300" />
          <button 
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`hover:text-blue-600 transition-colors ${!item.onClick ? 'font-semibold text-slate-700 cursor-default' : ''}`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};

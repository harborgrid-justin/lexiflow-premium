
import React from 'react';
import { X } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onClear?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onClear, children, title = "Filters", className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in slide-in-from-top-2 mb-4 ${className}`}>
      <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h4>
        <div className="flex items-center gap-3">
          {onClear && (
            <button onClick={onClear} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
};

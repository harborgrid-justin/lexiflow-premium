
import React from 'react';
import { Search } from 'lucide-react';

interface SearchToolbarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({ value, onChange, placeholder = "Search...", actions, className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {actions && (
        <div className="flex gap-2 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Filter, RefreshCcw, Download, SlidersHorizontal } from 'lucide-react';
import { Button } from '../common/Button';
import { CaseStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CaseListToolbarProps {
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  resetFilters: () => void;
}

export const CaseListToolbar: React.FC<CaseListToolbarProps> = ({
  statusFilter, setStatusFilter, typeFilter, setTypeFilter, resetFilters
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-3 rounded-lg border shadow-sm flex flex-col md:flex-row gap-3 items-center sticky top-0 z-20", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className={cn("flex items-center border rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow", theme.surfaceHighlight, theme.border.default)}>
            <Filter className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
            <select 
              className={cn("bg-transparent text-sm font-medium outline-none border-none pr-4 cursor-pointer", theme.text.primary)}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={cn("flex items-center border rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow", theme.surfaceHighlight, theme.border.default)}>
            <SlidersHorizontal className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
            <select 
              className={cn("bg-transparent text-sm font-medium outline-none border-none pr-4 cursor-pointer", theme.text.primary)}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Litigation">Litigation</option>
              <option value="M&A">M&A</option>
              <option value="IP">IP</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>
          
          {(statusFilter !== 'All' || typeFilter !== 'All') && (
            <button 
              onClick={resetFilters}
              className={cn("text-xs font-bold hover:underline px-2 transition-colors whitespace-nowrap", theme.primary.text)}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="ghost" size="sm" icon={RefreshCcw} onClick={() => {}} className={theme.text.secondary}>Sync</Button>
          <Button variant="outline" size="sm" icon={Download} onClick={() => {}}>Export</Button>
        </div>
      </div>
  );
};

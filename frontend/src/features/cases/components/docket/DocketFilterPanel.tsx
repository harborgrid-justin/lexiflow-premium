/**
 * DocketFilterPanel.tsx
 *
 * Sidebar filter panel for docket entries with search and case selection.
 *
 * @module components/docket/DocketFilterPanel
 * @category Case Management - Docket
 */

// External Dependencies
import React from 'react';
import { Filter } from 'lucide-react';

// Internal Dependencies - Components
import { SearchToolbar } from '@/components/organisms/SearchToolbar';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Case } from '@/types';

interface DocketFilterPanelProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  activeTab: 'all' | 'filings' | 'orders';
  setActiveTab: (t: 'all' | 'filings' | 'orders') => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  cases: Case[];
}

export const DocketFilterPanel: React.FC<DocketFilterPanelProps> = ({
  searchTerm, setSearchTerm, activeTab, setActiveTab, selectedCaseId, setSelectedCaseId, cases
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-full md:w-64 rounded-lg border shadow-sm flex flex-col shrink-0", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b", theme.border.default)}>
        <h3 className={cn("font-bold flex items-center", theme.text.primary)}><Filter className="h-4 w-4 mr-2"/> Docket Filters</h3>
      </div>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <SearchToolbar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search docket..."
            className="p-0 border-none shadow-none"
        />

        <div>
          <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Docket Type</label>
          <div className="space-y-1">
            <button
                onClick={() => setActiveTab('all')}
                className={cn("w-full text-left px-3 py-2 rounded text-sm transition-colors", activeTab === 'all' ? cn(theme.primary.light, theme.primary.text, "font-medium") : cn(theme.text.secondary, `hover:${theme.surface.highlight}`))}
            >
                All Entries
            </button>
            <button
                onClick={() => setActiveTab('filings')}
                className={cn("w-full text-left px-3 py-2 rounded text-sm transition-colors", activeTab === 'filings' ? cn(theme.primary.light, theme.primary.text, "font-medium") : cn(theme.text.secondary, `hover:${theme.surface.highlight}`))}
            >
                Filings Only
            </button>
            <button
                onClick={() => setActiveTab('orders')}
                className={cn("w-full text-left px-3 py-2 rounded text-sm transition-colors", activeTab === 'orders' ? cn(theme.primary.light, theme.primary.text, "font-medium") : cn(theme.text.secondary, `hover:${theme.surface.highlight}`))}
            >
                Orders & Judgments
            </button>
          </div>
        </div>

        {!selectedCaseId && (
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Active Cases</label>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {cases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={cn("w-full text-left px-3 py-2 rounded text-sm truncate transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
                >
                  <div className="font-medium truncate">{c.title}</div>
                  <div className={cn("text-xs", theme.text.tertiary)}>{c.id}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

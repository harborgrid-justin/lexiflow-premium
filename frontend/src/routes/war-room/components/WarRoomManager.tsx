/**
 * @module components/war-room/WarRoomManager
 * @category WarRoom
 * @description Default management page when no case is selected.
 * Shows available cases ready for War Room strategic planning.
 */

import { Button } from '@/components/atoms/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { Case } from '@/types';
import { AlertCircle, Briefcase, Clock, Search, Shield, Target } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface WarRoomManagerProps {
  onSelectCase: (caseId: string) => void;
}

export function WarRoomManager({ onSelectCase }: WarRoomManagerProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch all cases
  const { data: allCases = [], isLoading } = useQuery<Case[]>(
    ['cases', 'all'],
    DataService.cases.getAll
  );

  // Filter cases - prioritize active and trial-ready cases
  const filteredCases = useMemo(() => {
    return allCases.filter(c => {
      const matchesSearch = searchTerm === '' ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesType = typeFilter === 'all' || c.type === typeFilter;

      // War Room is most relevant for active cases
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allCases, searchTerm, statusFilter, typeFilter]);

  // Categorize cases
  const trialReadyCases = useMemo(() =>
    filteredCases.filter(c => c.status === 'Trial' || c.status === 'Active'),
    [filteredCases]
  );

  const activeCases = useMemo(() =>
    filteredCases.filter(c => c.status === 'Active' || c.status === 'Discovery'),
    [filteredCases]
  );

  if (isLoading) {
    return <LazyLoader message="Loading cases..." />;
  }

  return (
    <div className={cn("h-full flex flex-col", theme.background)}>
      {/* Header */}
      <div className={cn("px-6 pt-6 pb-4 border-b", theme.border.default)}>
        <div className="flex items-center gap-3 mb-4">
          <Target className={cn("h-8 w-8", theme.primary.text)} />
          <div>
            <h1 className={cn("text-2xl font-bold", theme.text.primary)}>War Room</h1>
            <p className={cn("text-sm", theme.text.secondary)}>Strategic trial planning and case preparation</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors",
                theme.surface.default,
                theme.border.default,
                theme.text.primary,
                "focus:border-blue-500"
              )}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className={cn(
              "px-4 py-2 rounded-lg border outline-none",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Discovery">Discovery</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
            aria-label="Filter by case type"
            className={cn(
              "px-4 py-2 rounded-lg border outline-none",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          >
            <option value="all">All Types</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className={cn("h-16 w-16 mb-4 opacity-20", theme.text.tertiary)} />
            <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>No Cases Found</h3>
            <p className={cn("text-sm", theme.text.secondary)}>
              {searchTerm ? 'Try adjusting your search or filters' : 'No cases available for War Room planning'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trial Ready Section */}
            {trialReadyCases.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className={cn("h-5 w-5", theme.primary.text)} />
                  <h2 className={cn("text-lg font-bold", theme.text.primary)}>Trial Ready</h2>
                  <span className={cn("text-xs px-2 py-1 rounded-full", theme.surface.highlight, theme.text.secondary)}>
                    {trialReadyCases.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trialReadyCases.map(c => (
                    <CaseCard key={c.id} case={c} onSelect={onSelectCase} priority theme={theme} />
                  ))}
                </div>
              </div>
            )}

            {/* Active Cases Section */}
            {activeCases.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className={cn("h-5 w-5", theme.text.primary)} />
                  <h2 className={cn("text-lg font-bold", theme.text.primary)}>Active Cases</h2>
                  <span className={cn("text-xs px-2 py-1 rounded-full", theme.surface.highlight, theme.text.secondary)}>
                    {activeCases.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCases.map(c => (
                    <CaseCard key={c.id} case={c} onSelect={onSelectCase} theme={theme} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Cases Section */}
            {filteredCases.length > 0 && filteredCases.some(c => !trialReadyCases.includes(c) && !activeCases.includes(c)) && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className={cn("h-5 w-5", theme.text.secondary)} />
                  <h2 className={cn("text-lg font-bold", theme.text.primary)}>Other Cases</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCases
                    .filter(c => !trialReadyCases.includes(c) && !activeCases.includes(c))
                    .map(c => (
                      <CaseCard key={c.id} case={c} onSelect={onSelectCase} theme={theme} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Case Card Component
interface CaseCardProps {
  case: Case;
  onSelect: (caseId: string) => void;
  priority?: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
}

const CaseCard: React.FC<CaseCardProps> = ({ case: c, onSelect, priority, theme }) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        theme.surface.default,
        theme.border.default,
        priority && "ring-2 ring-amber-500"
      )}
      onClick={() => onSelect(c.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-semibold text-sm mb-1 line-clamp-2", theme.text.primary)}>
            {c.title}
          </h3>
          <p className={cn("text-xs font-mono", theme.text.tertiary)}>
            {c.caseNumber}
          </p>
        </div>
        {priority && (
          <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            c.status === 'Trial' && "bg-red-100 text-red-700",
            c.status === 'Active' && "bg-green-100 text-green-700",
            c.status === 'Discovery' && "bg-blue-100 text-blue-700"
          )}
        >
          {c.status}
        </span>
        {c.type && (
          <span className={cn("text-xs px-2 py-1 rounded-full", theme.surface.highlight, theme.text.secondary)}>
            {c.type}
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-3"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect(c.id);
        }}
      >
        Enter War Room
      </Button>
    </div>
  );
};

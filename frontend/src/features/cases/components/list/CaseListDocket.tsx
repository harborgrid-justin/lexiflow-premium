/**
 * CaseListDocket.tsx
 *
 * Unified docket management view combining upcoming hearings,
 * pending motions, and court calendar deadlines.
 *
 * @module components/case-list/CaseListDocket
 * @category Case Management - Docket Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, ArrowRight, Calendar, Link, Plus, RefreshCcw } from 'lucide-react';
import React, { useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '@/types';

interface CaseListDocketProps {
  onSelectCase?: (c: Case) => void;
}

interface DocketItem {
  id: string;
  date: string;
  time: string;
  matter: string;
  caseId: string;
  event: string;
  type: string;
  location: string;
  priority: string;
}

export const CaseListDocket: React.FC<CaseListDocketProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();

  const { data: docket = [], isLoading: loadingDocket } = useQuery(queryKeys.docket.all(), async () => {
    const svc = DataService.docket;
    return await svc.getAll();
  });
  const { data: motions = [], isLoading: loadingMotions } = useQuery(queryKeys.motions.all(), async () => {
    const svc = DataService.motions;
    return await svc.getAll();
  });
  const { data: cases = [], isLoading: loadingCases } = useQuery(queryKeys.cases.all(), async () => {
    const svc = DataService.cases;
    return await svc.getAll();
  });

  const isLoading = loadingDocket || loadingMotions || loadingCases;

  const allDocketItems = useMemo(() => {
    if (isLoading) return [];

    // Ensure arrays
    const safeMotions = Array.isArray(motions) ? motions : [];
    const safeCases = Array.isArray(cases) ? cases : [];
    const safeDocket = Array.isArray(docket) ? docket : [];

    const items: DocketItem[] = [];

    // Add docket entries
    safeDocket.forEach(d => {
      const relatedCase = safeCases.find(c => c.id === d.caseId);
      items.push({
        id: `d-${d.id}`,
        date: d.date || d.dateFiled || d.entryDate,
        time: d.time || 'N/A',
        matter: relatedCase?.title || d.caseId,
        caseId: d.caseId,
        event: d.description || d.entry || 'Docket Entry',
        type: d.entryType || 'Entry',
        location: d.location || 'N/A',
        priority: d.priority || 'Medium'
      });
    });

    // Add motions with hearing dates
    safeMotions.forEach(m => {
      if (m.hearingDate) {
        const relatedCase = safeCases.find(c => c.id === m.caseId);
        items.push({
          id: `h-${m.id}`,
          date: m.hearingDate,
          time: m.hearingTime || '09:00 AM',
          matter: relatedCase?.title || m.caseId,
          caseId: m.caseId,
          event: `Hearing: ${m.title}`,
          type: 'Hearing',
          location: relatedCase?.court || 'TBD',
          priority: 'High'
        });
      }
    });

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [isLoading, motions, cases, docket]);


  const handleNav = (caseId: string) => {
    if (onSelectCase && cases) {
      const found = cases.find((c: Case) => c.id === caseId);
      if (found) onSelectCase(found);
    }
  };

  const renderRow = (item: DocketItem) => (
    <div key={item.id} className={cn("flex items-center border-b h-[64px] px-6 transition-colors group", theme.border.default, `hover:${theme.surface.highlight}`)}>
      <div className={cn("w-1/4 font-bold whitespace-nowrap", theme.text.primary)}>
        <div className="flex items-center">
          <Calendar className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
          {item.date}
        </div>
      </div>
      <div className={cn("w-1/4 font-mono text-xs", theme.text.secondary)}>{item.time}</div>
      <div className="w-1/2">
        <div className={cn("font-medium truncate", theme.text.primary)}>{item.matter}</div>
        <button onClick={() => handleNav(item.caseId)} className={cn("text-xs font-mono flex items-center hover:underline", theme.primary.text)}>
          {item.caseId} <ArrowRight className="h-2 w-2 ml-1" />
        </button>
      </div>
      <div className="w-1/2">
        <div className={cn("flex items-center", theme.text.primary)}>
          {item.priority === 'Critical' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
          {item.event}
        </div>
      </div>
      <div className={cn("w-1/4 text-xs", theme.text.secondary)}>{item.location}</div>
      <div className="w-1/4">
        <Badge variant={item.type === 'Hearing' ? 'error' : item.type === 'Deadline' ? 'warning' : 'info'}>
          {item.type}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className={cn("rounded-lg border overflow-hidden shadow-sm animate-fade-in flex flex-col h-full", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Master Docket</h3>
          <p className={cn("text-xs flex items-center mt-1", theme.text.secondary)}>
            <RefreshCcw className="h-3 w-3 mr-1" /> Synced with Court ECF & Internal Calendars
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Link}>Link Docket</Button>
          <Button variant="secondary" size="sm" icon={RefreshCcw}>Force Sync</Button>
          <Button variant="primary" size="sm" icon={Plus}>Add Entry</Button>
        </div>
      </div>

      {isLoading ? <LazyLoader /> : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            <div className="w-1/4">Date</div>
            <div className="w-1/4">Time</div>
            <div className="w-1/2">Matter / Docket</div>
            <div className="w-1/2">Event</div>
            <div className="w-1/4">Location</div>
            <div className="w-1/4">Type</div>
          </div>
          <div className="flex-1 relative">
            {allDocketItems.length === 0 ? (
              <div className={cn("flex items-center justify-center h-full", theme.text.tertiary)}>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No upcoming docket events.</p>
                  <p className="text-xs mt-2 opacity-60">Add entries or link a docket to get started.</p>
                </div>
              </div>
            ) : (
              <VirtualList
                items={allDocketItems}
                height="100%"
                itemHeight={64}
                renderItem={renderRow}
                emptyMessage="No upcoming docket events."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

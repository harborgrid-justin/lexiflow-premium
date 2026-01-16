/**
 * CaseOverview.tsx
 *
 * Comprehensive case overview dashboard with matter info, active workstreams,
 * key stats, and quick action modals.
 *
 * @module components/case-detail/overview/CaseOverview
 * @category Case Management - Overview
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with memoized case data
 * - Guideline 28: Theme usage is pure function for dashboard styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for overview transitions
 */

// External Dependencies
import React from 'react';
import { Users } from 'lucide-react';
// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { ActiveWorkstreams } from './ActiveWorkstreams';
import { CaseOverviewModals } from './CaseOverviewModals';
import { CaseOverviewStats } from './CaseOverviewStats';
import { MatterInfo } from './MatterInfo';
import { OverviewSidebar } from './OverviewSidebar';

// Internal Dependencies - Hooks & Context
import { useCaseOverview } from '@/hooks/useCaseOverview';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/lib/cn';

// Types & Interfaces
import { Case, Party, TimeEntry } from '@/types';

interface CaseOverviewProps {
  caseData: Case;
  onTimeEntryAdded: (entry: TimeEntry) => void;
  onNavigateToCase?: (c: Case) => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({ caseData, onTimeEntryAdded, onNavigateToCase }) => {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const {
    showTimeModal, setShowTimeModal,
    showLinkModal, setShowLinkModal,
    showTransferModal, setShowTransferModal,
    linkedCases,
    availableCases,
    handleSaveTime,
    handleLinkCase,
    handleTransferToAppeal
  } = useCaseOverview(caseData, onTimeEntryAdded, onNavigateToCase);

  const { data: parties = [] } = useQuery<Party[]>(
    ['cases', caseData.id, 'parties'],
    () => DataService.cases.getParties(caseData.id),
    { initialData: caseData.parties || [] }
  );

  const activeProjects = caseData.projects?.filter(p => p.status === 'In Progress') || [];

  return (
    <div className="space-y-6">
      <CaseOverviewModals
        caseData={caseData}
        showTimeModal={showTimeModal} setShowTimeModal={setShowTimeModal}
        showLinkModal={showLinkModal} setShowLinkModal={setShowLinkModal}
        showTransferModal={showTransferModal} setShowTransferModal={setShowTransferModal}
        availableCases={availableCases}
        onSaveTime={handleSaveTime}
        onLinkCase={handleLinkCase}
        onTransfer={handleTransferToAppeal}
      />

      <CaseOverviewStats caseId={caseData.id} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <MatterInfo caseData={caseData} />
          <ActiveWorkstreams activeProjects={activeProjects} />

          <div className={cn("p-6 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
                <Users className={cn("h-5 w-5 mr-2", theme.text.secondary)} /> Key Parties
              </h3>
              <Button variant="ghost" size="sm" className={theme.primary.text}>View All</Button>
            </div>
            <TableContainer responsive="card" className="shadow-none border-0 rounded-none">
              <TableHeader><TableHead>Role</TableHead><TableHead>Entity Name</TableHead><TableHead>Type</TableHead></TableHeader>
              <TableBody>
                {parties.slice(0, 4).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className={cn("text-sm font-medium", theme.text.primary)}>{p.role}</TableCell>
                    <TableCell className={cn("text-sm", theme.text.secondary)}>{p.name}</TableCell>
                    <TableCell><span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", theme.surface.highlight, theme.text.secondary)}>{p.type}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
            {(!parties || parties.length === 0) && <div className={cn("text-center py-4 italic text-sm", theme.text.tertiary)}>No parties listed.</div>}
          </div>
        </div>

        <div className="space-y-6">
          <OverviewSidebar
            caseData={caseData}
            linkedCases={linkedCases}
            onShowTimeModal={() => setShowTimeModal(true)}
            onShowLinkModal={() => setShowLinkModal(true)}
            onShowTransferModal={() => setShowTransferModal(true)}
            onNavigateToCase={onNavigateToCase}
          />
        </div>
      </div>
    </div>
  );
};

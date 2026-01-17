/**
 * CaseListArchived.tsx
 *
 * View for archived/closed cases with restore functionality.
 * Displays historical case data in table format.
 *
 * @module components/case-list/CaseListArchived
 * @category Case Management - Archive Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table';

// Hooks & Context
import { useModalState } from '@/hooks/useModalState';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";

// Services & Utils
import { cn } from '@/lib/cn';
import { DataService } from '@/services/data/data-service.service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { type Case } from '@/types';

interface CaseListArchivedProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListArchived: React.FC<CaseListArchivedProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();
  const retrieveModal = useModalState();
  const [retrieveCaseId, setRetrieveCaseId] = React.useState<string | null>(null);

  // Enterprise Data Access
  const { data: archivedCases = [], isLoading } = useQuery<Case[]>(
    ['cases', 'archived'],
    () => DataService.cases.getArchived()
  );

  // Ensure archivedCases is always an array
  const safeArchivedCases = archivedCases;

  const handleRetrieve = async (id: string) => {
    setRetrieveCaseId(id);
    retrieveModal.open();
  };

  const confirmRetrieve = async () => {
    if (retrieveCaseId) {
      const found = await DataService.cases.getById(retrieveCaseId);
      if (found && onSelectCase) {
        onSelectCase(found);
      }
      setRetrieveCaseId(null);
    }
  };

  if (isLoading) return <AdaptiveLoader contentType="table" itemCount={8} shimmer />;

  return (
    <div className="space-y-4">
      <div className={cn("p-4 rounded text-center text-sm border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
        Showing cases closed in the last 12 months. Older cases are in Cold Storage.
      </div>
      <TableContainer responsive="card">
        <TableHeader>
          <TableHead>Closed Date</TableHead>
          <TableHead>Matter</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableHeader>
        <TableBody>
          {safeArchivedCases.map((c) => (
            <TableRow key={c.id}>
              <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{c.dateTerminated ? new Date(c.dateTerminated.toString()).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell className={cn("font-medium", theme.text.primary)}>{c.title}</TableCell>
              <TableCell>{c.client}</TableCell>
              <TableCell><Badge variant="success">{c.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleRetrieve(c.id)}>Retrieve</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      <ConfirmDialog
        isOpen={retrieveModal.isOpen}
        onClose={retrieveModal.close}
        onConfirm={confirmRetrieve}
        title="Retrieve Case"
        message="Retrieve case from Cold Storage? This may incur a fee."
        confirmText="Retrieve"
        variant="warning"
      />
    </div>
  );
};

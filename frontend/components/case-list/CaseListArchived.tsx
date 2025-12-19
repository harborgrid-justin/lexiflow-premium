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
import { Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AdaptiveLoader } from '../common/AdaptiveLoader';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '../../services/infrastructure/queryClient';
import { useModalState } from '../../hooks/useModalState';

// Services & Utils
import { DataService } from '../../services/data/dataService';
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '../../types';

interface CaseListArchivedProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListArchived: React.FC<CaseListArchivedProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();
  const retrieveModal = useModalState();
  const [retrieveCaseId, setRetrieveCaseId] = React.useState<string | null>(null);

  // Enterprise Data Access
  const { data: archivedCases = [], isLoading } = useQuery<any[]>(
      ['cases', 'archived'],
      () => DataService.cases.getArchived()
  );

  // Ensure archivedCases is always an array
  const safeArchivedCases = Array.isArray(archivedCases) ? archivedCases : [];

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
          {safeArchivedCases.map(c => (
            <TableRow key={c.id}>
                <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{c.date}</TableCell>
                <TableCell className={cn("font-medium", theme.text.primary)}>{c.title}</TableCell>
                <TableCell>{c.client}</TableCell>
                <TableCell><Badge variant="success">{c.outcome}</Badge></TableCell>
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

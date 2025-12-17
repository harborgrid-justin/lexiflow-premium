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

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '../../services/queryClient';

// Services & Utils
import { DataService } from '../../services/dataService';
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

  // Enterprise Data Access
  const { data: archivedCases = [], isLoading } = useQuery<any[]>(
      ['cases', 'archived'],
      () => DataService.cases.getArchived()
  );

  // Ensure archivedCases is always an array
  const safeArchivedCases = Array.isArray(archivedCases) ? archivedCases : [];

  const handleRetrieve = async (id: string) => {
      const found = await DataService.cases.getById(id);
      if (found && onSelectCase) {
          if (confirm("Retrieve case from Cold Storage? This may incur a fee.")) {
              onSelectCase(found);
          }
      }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

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
    </div>
  );
};
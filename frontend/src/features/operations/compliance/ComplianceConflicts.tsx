/**
 * @module components/compliance/ComplianceConflicts
 * @category Compliance
 * @description Conflict check management and resolution tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Download, Filter, Plus, User } from 'lucide-react';
import { memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';
import { useComplianceConflicts } from './hooks/useComplianceConflicts';

// Components
import { Badge } from '@/shared/ui/atoms/Badge/Badge';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================

function ComplianceConflictsComponent() {
  const { theme } = useTheme();

  // Feature Hook
  const [state, actions] = useComplianceConflicts();
  const { filteredConflicts, searchTerm, status } = state;
  const { setSearchTerm, runNewCheck, viewReport } = actions;

  const isLoading = status === 'loading';
  const isFiltering = status === 'filtering';

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading conflict checks...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border gap-4", theme.surface.highlight, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Conflict Checks</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Search history and run new clearance reports.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={runNewCheck}>Run New Check</Button>
      </div>

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by entity or requester..."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Filter}>Filter</Button>
            <Button variant="outline" size="sm" icon={Download}>Export</Button>
          </div>
        }
      />

      <div className={cn(isFiltering && "opacity-60 transition-opacity")}>
        <TableContainer responsive="card">
          <TableHeader>
            <TableHead>Entity Name</TableHead>
            <TableHead>Date Checked</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Potential Matches</TableHead>
            <TableHead>Checked By</TableHead>
            <TableHead className="text-right">Report</TableHead>
          </TableHeader>
          <TableBody>
            {filteredConflicts.map(c => (
              <TableRow key={c.id}>
                <TableCell className={cn("font-medium", theme.text.primary)}>{c.entityName}</TableCell>
                <TableCell className={cn("text-xs font-mono", theme.text.secondary)}>{c.date}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'Cleared' ? 'success' : c.status === 'Flagged' ? 'error' : 'warning'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {c.foundIn.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.foundIn.map((hit, i) => (
                        <span key={`conflict-${c.id}-hit-${hit}-${i}`} className={cn("text-[10px] px-2 py-0.5 rounded border flex items-center", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                          {hit}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={cn("text-xs italic", theme.text.tertiary)}>No hits found</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className={cn("h-3 w-3", theme.text.tertiary)} />
                    <span className={cn("text-xs", theme.text.secondary)}>{c.checkedBy}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => viewReport(c.id)}>View PDF</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>
    </div>
  );
};

export const ComplianceConflicts = memo(ComplianceConflictsComponent);
ComplianceConflicts.displayName = 'ComplianceConflicts';

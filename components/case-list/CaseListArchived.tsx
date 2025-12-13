import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { Case } from '../../types';
import { useQuery } from '../../services/queryClient';
import { Loader2 } from 'lucide-react';

interface CaseListArchivedProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListArchived: React.FC<CaseListArchivedProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: archivedCases = [], isLoading } = useQuery<any[]>(
      ['cases', 'archived'],
      DataService.cases.getArchived
  );

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
          {archivedCases.map(c => (
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
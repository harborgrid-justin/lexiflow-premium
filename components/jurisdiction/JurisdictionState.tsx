
import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { SearchToolbar } from '../common/SearchToolbar';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { Loader2 } from 'lucide-react';

export const JurisdictionState: React.FC = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');

  // Performance Engine: useQuery
  const { data: states = [], isLoading } = useQuery<any[]>(
      ['jurisdiction', 'state_courts'],
      DataService.jurisdiction.getStateCourts
  );

  const filteredStates = states.filter(s => 
      s.state.toLowerCase().includes(filter.toLowerCase()) || 
      s.court.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-4">
      <SearchToolbar 
        value={filter} 
        onChange={setFilter} 
        placeholder="Search state courts..." 
        actions={
          <div className={cn("text-xs font-medium px-3 py-1.5 rounded-full border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
            Showing {filteredStates.length} jurisdictions
          </div>
        }
      />

      <TableContainer>
        <TableHeader>
          <TableHead>State</TableHead>
          <TableHead>Court System</TableHead>
          <TableHead>Jurisdiction Level</TableHead>
          <TableHead>e-Filing Policy</TableHead>
          <TableHead>System Provider</TableHead>
        </TableHeader>
        <TableBody>
          {filteredStates.map((s, i) => (
            <TableRow key={i}>
              <TableCell className={cn("font-medium", theme.text.primary)}>{s.state}</TableCell>
              <TableCell>{s.court}</TableCell>
              <TableCell>{s.level}</TableCell>
              <TableCell>
                <Badge variant={s.eFiling === 'Required' ? 'error' : 'success'}>{s.eFiling}</Badge>
              </TableCell>
              <TableCell className={cn("text-xs", theme.text.secondary)}>{s.system}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

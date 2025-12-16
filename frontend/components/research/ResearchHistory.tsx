
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { ExternalLink, Clock, Loader2 } from 'lucide-react';
import { SearchToolbar } from '../common/SearchToolbar';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { ResearchSession } from '../../types';
import { useQuery } from '../../services/queryClient';
import { queryKeys } from '../../utils/queryKeys';

export const ResearchHistory: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: history = [], isLoading } = useQuery<ResearchSession[]>(
      queryKeys.research.history(),
      DataService.research.getHistory
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <SearchToolbar 
        value="" 
        onChange={() => {}} 
        placeholder="Search past queries..." 
      />

      <TableContainer>
        <TableHeader>
          <TableHead>Query</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Sources Found</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableHeader>
        <TableBody>
          {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-600"/></TableCell></TableRow>
          ) : history.map(item => (
            <TableRow key={item.id}>
              <TableCell className={cn("font-medium", theme.text.primary)}>{item.query}</TableCell>
              <TableCell>
                <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                  <Clock className="h-3 w-3 mr-1"/> {item.timestamp}
                </div>
              </TableCell>
              <TableCell>{item.sources.length}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" className="text-blue-600" icon={ExternalLink}>View Results</Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && history.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No research history found.</TableCell></TableRow>
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};


import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { Button } from '@/components/atoms/Button';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';
import { ExternalLink, Clock } from 'lucide-react';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services/data/dataService';
import { ResearchSession } from '@/types';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';

export const ResearchHistory: React.FC = () => {
  const { theme } = useTheme();

  // Enterprise Data Access
  const { data: history = [], isLoading } = useQuery<ResearchSession[]>(
      queryKeys.research.history(),
      () => DataService.research.getHistory()
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
              <TableRow><TableCell colSpan={4} className="p-0"><AdaptiveLoader contentType="table" shimmer itemCount={5} /></TableCell></TableRow>
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


import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { AdaptiveLoader } from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { ResearchSession } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import { Clock, ExternalLink } from 'lucide-react';
export function ResearchHistory() {
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
        onChange={() => { }}
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
                  <Clock className="h-3 w-3 mr-1" /> {item.timestamp}
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

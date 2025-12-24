
import React from 'react';
import { Bookmark, FileText, Scale, BookmarkMinus } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/organisms/Table';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AdaptiveLoader } from '../../components/molecules/AdaptiveLoader';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { useTheme } from '../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Citation } from '../../../types';

export const SavedAuthorities: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: savedItems = [], isLoading } = useQuery<Citation[]>(
      queryKeys.research.saved(),
      () => DataService.research.getSavedAuthorities()
  );

  if (isLoading) return <AdaptiveLoader contentType="list" shimmer itemCount={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex items-center gap-3 p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <Bookmark className={cn("h-5 w-5", theme.text.secondary)}/>
            <div>
                <h3 className={cn("font-bold text-sm", theme.text.primary)}>Bookmarked Authorities</h3>
                <p className={cn("text-xs", theme.text.secondary)}>Quick access to frequently cited cases and statutes.</p>
            </div>
        </div>

        {savedItems.length === 0 ? (
            <EmptyState
                icon={BookmarkMinus}
                title="No saved authorities"
                description="Bookmark cases and statutes to quickly access them here."
            />
        ) : (
            <TableContainer>
                <TableHeader>
                    <TableHead>Citation</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>My Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {savedItems.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className={cn("font-bold font-mono text-xs", theme.primary.text)}>{item.citation}</TableCell>
                            <TableCell className={cn("font-medium", theme.text.primary)}>{item.title}</TableCell>
                            <TableCell>
                                <Badge variant="neutral" className="flex items-center w-fit gap-1">
                                    {item.type === 'Case Law' ? <Scale className="h-3 w-3"/> : <FileText className="h-3 w-3"/>}
                                    {item.type}
                                </Badge>
                            </TableCell>
                            <TableCell className={cn("text-xs italic", theme.text.secondary)}>{item.description}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="text-red-600">Remove</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        )}
    </div>
  );
};


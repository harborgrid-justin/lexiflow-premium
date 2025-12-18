
import React from 'react';
import { Bookmark, FileText, Scale, Loader2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';
import { queryKeys } from '../../utils/queryKeys';
import { Citation } from '../../types';

export const SavedAuthorities: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: savedItems = [], isLoading } = useQuery<Citation[]>(
      queryKeys.research.saved(),
      () => DataService.research.getSavedAuthorities()
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex items-center gap-3 p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <Bookmark className={cn("h-5 w-5", theme.text.secondary)}/>
            <div>
                <h3 className={cn("font-bold text-sm", theme.text.primary)}>Bookmarked Authorities</h3>
                <p className={cn("text-xs", theme.text.secondary)}>Quick access to frequently cited cases and statutes.</p>
            </div>
        </div>

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
                {savedItems.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No bookmarked authorities.</TableCell></TableRow>
                )}
            </TableBody>
        </TableContainer>
    </div>
  );
};


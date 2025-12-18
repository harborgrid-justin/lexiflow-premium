
/**
 * @module EvidenceCustodyLog
 * @category Evidence
 * @description Displays a master chronological log of custody events for all evidence items.
 * Provides filtering, searching, and export capabilities for the entire chain of custody audit trail.
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download } from 'lucide-react';

// Common Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

// Services & Types
import { DataService } from '../../services/data/dataService'';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/data/db'';
import { EvidenceItem } from '../../types';

export const EvidenceCustodyLog: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Enterprise Data Access: Fetch from the main evidence store to ensure consistency
  const { data: evidence = [] } = useQuery<EvidenceItem[]>(
      [STORES.EVIDENCE, 'all'],
      DataService.evidence.getAll
  );

  // Flatten custody events from all evidence items
  const events = useMemo(() => {
      return evidence.flatMap(item => 
        item.chainOfCustody.map(event => ({
          ...event,
          itemId: item.id,
          itemTitle: item.title,
          caseId: item.caseId
        }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [evidence]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
        e.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
           <h3 className={cn("font-bold", theme.text.primary)}>Master Chain of Custody</h3>
           <p className={cn("text-sm", theme.text.secondary)}>Audit trail for all evidence transfers across the firm.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
                <input 
                    className={cn("w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surface.highlight, theme.border.default, theme.text.primary)}
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" icon={Filter}>Filter</Button>
            <Button variant="outline" icon={Download}>Export</Button>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
            <TableHead>Date / Time</TableHead>
            <TableHead>Evidence Item</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Case Ref</TableHead>
            <TableHead>Notes</TableHead>
        </TableHeader>
        <TableBody>
            {filteredEvents.map((evt, idx) => (
                <TableRow key={`${evt.id}-${idx}`}>
                    <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{evt.date}</TableCell>
                    <TableCell className={cn("font-medium", theme.text.primary)}>{evt.itemTitle}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            evt.action.includes('Collected') ? cn(theme.status.success.bg, theme.status.success.text) : 
                            evt.action.includes('Transfer') ? cn(theme.status.info.bg, theme.status.info.text) : cn(theme.surface.highlight, theme.text.secondary)
                        }`}>
                            {evt.action}
                        </span>
                    </TableCell>
                    <TableCell className={theme.text.primary}>{evt.actor}</TableCell>
                    <TableCell className="text-xs text-blue-600 font-mono">{evt.caseId}</TableCell>
                    <TableCell className={cn("text-xs italic truncate max-w-xs", theme.text.tertiary)}>{evt.notes || '-'}</TableCell>
                </TableRow>
            ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};



import React, { useMemo, useState, useEffect } from 'react';
import { RefreshCcw, Plus, Calendar, AlertTriangle, Link, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Case } from '../../types';
import { InfiniteScrollTrigger } from '../common/InfiniteScrollTrigger';
import { DataService } from '../../services/dataService';

interface CaseListDocketProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListDocket: React.FC<CaseListDocketProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [allDocketItems, setAllDocketItems] = useState<any[]>([]);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
      const load = async () => {
          const [docket, motions, caseList] = await Promise.all([
              DataService.docket.getAll(),
              DataService.motions.getAll(),
              DataService.cases.getAll()
          ]);
          setCases(caseList);

          const items: any[] = [];

          // Add Hearings from Motions
          motions.forEach(m => {
            if (m.hearingDate) {
              const relatedCase = caseList.find(c => c.id === m.caseId);
              items.push({
                id: `h-${m.id}`,
                date: m.hearingDate,
                time: '09:00 AM', // Mock time
                matter: relatedCase?.title || m.caseId,
                caseId: m.caseId,
                event: `Hearing: ${m.title}`,
                type: 'Hearing',
                location: relatedCase?.court || 'TBD',
                priority: 'High'
              });
            }
          });

          // Add Mock Deadlines (Simulated sync) - could be real data later
          items.push(
            { id: 'd-1', date: '2024-03-30', time: '11:59 PM', matter: 'Martinez v. TechCorp', caseId: 'C-2024-001', event: 'Discovery Cutoff', type: 'Deadline', location: 'N/A', priority: 'Critical' },
            { id: 'd-2', date: '2024-04-15', time: '05:00 PM', matter: 'In Re: OmniGlobal', caseId: 'C-2024-112', event: 'Expert Disclosure', type: 'Filing', location: 'E-File', priority: 'Medium' }
          );

          setAllDocketItems(items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      };
      load();
  }, []);

  const visibleItems = useMemo(() => allDocketItems.slice(0, visibleCount), [allDocketItems, visibleCount]);

  const handleLoadMore = () => {
      setIsLoading(true);
      setTimeout(() => {
          setVisibleCount(prev => prev + 5);
          setIsLoading(false);
      }, 800);
  };

  const handleNav = (caseId: string) => {
    if (onSelectCase) {
      const found = cases.find(c => c.id === caseId);
      if (found) onSelectCase(found);
    }
  };

  return (
    <div className={cn("rounded-lg border overflow-hidden shadow-sm animate-fade-in", theme.surface, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Master Docket</h3>
          <p className={cn("text-xs flex items-center mt-1", theme.text.secondary)}>
            <RefreshCcw className="h-3 w-3 mr-1"/> Synced with Court ECF & Internal Calendars
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Link}>Link Docket</Button>
          <Button variant="secondary" size="sm" icon={RefreshCcw}>Force Sync</Button>
          <Button variant="primary" size="sm" icon={Plus}>Add Entry</Button>
        </div>
      </div>
      <TableContainer className="rounded-none border-0 shadow-none">
        <TableHeader>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Matter / Docket</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Type</TableHead>
        </TableHeader>
        <TableBody>
          {visibleItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className={cn("font-bold whitespace-nowrap", theme.text.primary)}>
                <div className="flex items-center">
                  <Calendar className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                  {item.date}
                </div>
              </TableCell>
              <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{item.time}</TableCell>
              <TableCell className="max-w-xs">
                  <div className={cn("font-medium truncate", theme.text.primary)}>{item.matter}</div>
                  <button 
                    onClick={() => handleNav(item.caseId)}
                    className={cn("text-xs font-mono flex items-center hover:underline", theme.primary.text)}
                  >
                    {item.caseId} <ArrowRight className="h-2 w-2 ml-1"/>
                  </button>
              </TableCell>
              <TableCell>
                <div className={cn("flex items-center", theme.text.primary)}>
                  {item.priority === 'Critical' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2"/>}
                  {item.event}
                </div>
              </TableCell>
              <TableCell className={cn("text-xs", theme.text.secondary)}>{item.location}</TableCell>
              <TableCell>
                <Badge variant={item.type === 'Hearing' ? 'error' : item.type === 'Deadline' ? 'warning' : 'info'}>
                  {item.type}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {visibleItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className={cn("text-center py-8", theme.text.tertiary)}>No upcoming docket events.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableContainer>
      <InfiniteScrollTrigger 
        onLoadMore={handleLoadMore}
        hasMore={visibleCount < allDocketItems.length}
        isLoading={isLoading}
        className="border-t bg-slate-50/50"
      />
    </div>
  );
};

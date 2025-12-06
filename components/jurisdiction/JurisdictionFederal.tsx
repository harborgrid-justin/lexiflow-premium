import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { ExternalLink, Landmark, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { Case } from '../../types';

export const JurisdictionFederal: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: cases = [], isLoading } = useQuery<Case[]>(
      [STORES.CASES, 'all'],
      DataService.cases.getAll
  );

  // Derive courts from cases
  const courts = React.useMemo(() => {
      const staticCourts = [
            { name: 'U.S. Supreme Court', circuit: 'SCOTUS', type: 'Highest', judges: 9, status: 'Active Session' },
            { name: '9th Circuit Court of Appeals', circuit: '9th', type: 'Appellate', judges: 29, status: 'Recess' },
            { name: 'N.D. California', circuit: '9th', type: 'District', judges: 14, status: 'Active' },
            { name: 'S.D. New York', circuit: '2nd', type: 'District', judges: 28, status: 'Active' },
      ];

      const activeCourtsMap = new Map();
      cases.forEach(c => {
            if (c.court && !staticCourts.some(sc => sc.name === c.court)) {
                if (!activeCourtsMap.has(c.court)) {
                    let type = 'District';
                    if (c.court.includes('Appeals') || c.court.includes('Circuit')) type = 'Appellate';
                    if (c.court.includes('Supreme')) type = 'Highest';

                    let circuit = 'Fed';
                    if (c.court.includes('4th')) circuit = '4th';
                    if (c.court.includes('9th')) circuit = '9th';

                    activeCourtsMap.set(c.court, {
                        name: c.court,
                        circuit: circuit,
                        type: type,
                        judges: 'N/A', 
                        status: 'Active (Inferred)'
                    });
                }
            }
      });

      return [...staticCourts, ...Array.from(activeCourtsMap.values())];
  }, [cases]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6">
      <div className={cn("p-6 rounded-lg shadow-sm flex items-center justify-between", theme.primary.DEFAULT, theme.text.inverse)}>
        <div>
          <h3 className="text-lg font-bold">Federal Judiciary System</h3>
          <p className="opacity-80 text-sm mt-1">Access Pacer records, standing orders, and circuit rules.</p>
        </div>
        <div className="p-3 bg-white/10 rounded-full">
          <Landmark className="h-8 w-8"/>
        </div>
      </div>

      <TableContainer responsive="card">
        <TableHeader>
          <TableHead>Court Name</TableHead>
          <TableHead>Circuit / District</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Active Judges</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Rules</TableHead>
        </TableHeader>
        <TableBody>
          {courts.map((court, i) => (
            <TableRow key={i}>
              <TableCell className={cn("font-bold", theme.text.primary)}>{court.name}</TableCell>
              <TableCell>{court.circuit}</TableCell>
              <TableCell><Badge variant="neutral">{court.type}</Badge></TableCell>
              <TableCell>{court.judges}</TableCell>
              <TableCell>
                <span className={cn(
                  "text-xs font-bold", 
                  court.status.includes('Active') ? theme.status.success.text : theme.status.warning.text
                )}>
                  {court.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <button className={cn("hover:underline text-xs flex items-center justify-end", theme.primary.text)}>
                  View Rules <ExternalLink className="h-3 w-3 ml-1"/>
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { ExternalLink, Landmark, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const JurisdictionFederal: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  // FIX: Use the correct STORES key
  const { data: courts = [], isLoading } = useQuery<any[]>(
      [STORES.JURISDICTIONS, 'federal'],
      DataService.jurisdiction.getFederal
  );

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
          <TableHead className="text-right">Rules</TableHead>
        </TableHeader>
        <TableBody>
          {courts.map((court, i) => (
            <TableRow key={i}>
              <TableCell className={cn("font-bold", theme.text.primary)}>{court.name}</TableCell>
              <TableCell>{court.region}</TableCell>
              <TableCell><Badge variant="neutral">{court.type}</Badge></TableCell>
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

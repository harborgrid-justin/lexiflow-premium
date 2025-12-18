
import React from 'react';
import { Globe, Plane, Loader2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';

export const JurisdictionInternational: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: rawTreaties = [], isLoading } = useQuery<any[]>(
      ['jurisdiction', 'treaties'],
      DataService.jurisdiction.getTreaties
  );

  // Defensive array validation
  const treaties = Array.isArray(rawTreaties) ? rawTreaties : [];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6">
      <div className={cn("p-8 rounded-lg flex justify-between items-center shadow-lg relative overflow-hidden", theme.primary.DEFAULT, theme.text.inverse)}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center"><Globe className="h-6 w-6 mr-3"/> Cross-Border Jurisdiction</h2>
          <p className="opacity-80 mt-2">Manage international service, discovery (Hague Evidence), and enforcement.</p>
        </div>
        <Plane className="h-24 w-24 absolute right-4 -bottom-4 opacity-10 rotate-[-15deg]"/>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Treaty / Convention</TableHead>
          <TableHead>Subject Matter</TableHead>
          <TableHead>Status (US)</TableHead>
          <TableHead>Signatory Count</TableHead>
        </TableHeader>
        <TableBody>
          {treaties.map((t, i) => (
            <TableRow key={i}>
              <TableCell className={cn("font-bold", theme.text.primary)}>{t.name}</TableCell>
              <TableCell>{t.type}</TableCell>
              <TableCell>
                <span className={cn("font-bold", theme.status.success.text)}>{t.status}</span>
              </TableCell>
              <TableCell>{t.parties}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};


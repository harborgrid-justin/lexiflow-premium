import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { Globe, Plane } from 'lucide-react';
import React from 'react';

export const JurisdictionInternational: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: rawTreaties = [], isLoading } = useQuery<unknown[]>(
    ['jurisdiction', 'treaties'],
    DataService.jurisdiction.getTreaties
  );

  // Defensive array validation
  const treaties = Array.isArray(rawTreaties) ? rawTreaties : [];

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={10} shimmer />;

  return (
    <div className="space-y-6">
      <div className={cn("p-8 rounded-lg flex justify-between items-center shadow-lg relative overflow-hidden", theme.primary.DEFAULT, theme.text.inverse)}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center"><Globe className="h-6 w-6 mr-3" /> Cross-Border Jurisdiction</h2>
          <p className="opacity-80 mt-2">Manage international service, discovery (Hague Evidence), and enforcement.</p>
        </div>
        <Plane className="h-24 w-24 absolute right-4 -bottom-4 opacity-10 rotate-[-15deg]" />
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Treaty / Convention</TableHead>
          <TableHead>Subject Matter</TableHead>
          <TableHead>Status (US)</TableHead>
          <TableHead>Signatory Count</TableHead>
        </TableHeader>
        <TableBody>
          {treaties.map((t: unknown, i: number) => (
            <TableRow key={i}>
              <TableCell className={cn("font-bold", theme.text.primary)}>{(t as { name: string }).name}</TableCell>
              <TableCell>{(t as { type: string }).type}</TableCell>
              <TableCell>
                <span className={cn("font-bold", theme.status.success.text)}>{(t as { status: string }).status}</span>
              </TableCell>
              <TableCell>{(t as { parties: number }).parties}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

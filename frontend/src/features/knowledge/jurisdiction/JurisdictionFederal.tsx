/**
 * @module components/jurisdiction/JurisdictionFederal
 * @category Jurisdiction
 * @description Federal court system with circuit and district information.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ExternalLink, Landmark } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Badge } from '../../common/Badge';
import { AdaptiveLoader } from '../../common/AdaptiveLoader';

// Utils & Constants
import { cn } from '@/utils/cn';

export const JurisdictionFederal: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: rawCourts = [], isLoading } = useQuery<any[]>(
      ['jurisdictions', 'federal'],
      DataService.jurisdiction.getFederal
  );

  // Defensive array validation
  const courts = Array.isArray(rawCourts) ? rawCourts : [];

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={10} shimmer />;

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



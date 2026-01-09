/**
 * @module components/jurisdiction/JurisdictionState
 * @category Jurisdiction
 * @description State court systems with search and filtering.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useMemo, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { AdaptiveLoader } from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { filterStates } from './utils';

interface StateJurisdiction {
  name: string;
  region: string;
  type?: string;
}

export const JurisdictionState: React.FC = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const [, startTransition] = useTransition();

  // Performance Engine: useQuery
  const { data: rawStates = [], isLoading } = useQuery<StateJurisdiction[]>(
    ['jurisdictions', 'state'],
    DataService.jurisdiction.getState
  );

  // Defensive array validation and filtering
  const filteredStates = useMemo(
    () => {
      const states = Array.isArray(rawStates) ? rawStates : [];
      if (!states) return [];
      return filterStates(states as StateJurisdiction[], filter);
    },
    [filter, rawStates]
  );

  const handleFilterChange = useCallback((value: string) => {
    startTransition(() => {
      setFilter(value);
    });
  }, []);

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={10} shimmer />;

  return (
    <div className="space-y-4">
      <SearchToolbar
        value={filter}
        onChange={handleFilterChange}
        placeholder="Search state courts..."
        actions={
          <div className={cn("text-xs font-medium px-3 py-1.5 rounded-full border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            Showing {filteredStates.length} jurisdictions
          </div>
        }
      />

      <TableContainer responsive="card">
        <TableHeader>
          <TableHead>State</TableHead>
          <TableHead>Court System</TableHead>
          <TableHead>Jurisdiction Level</TableHead>
        </TableHeader>
        <TableBody>
          {filteredStates.map((s, i) => (
            <TableRow key={`state-${s.region}-${i}`}>
              <TableCell className={cn("font-medium", theme.text.primary)}>{s.region}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

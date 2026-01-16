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
import { useCallback, useMemo, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Components
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader/AdaptiveLoader';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';

// Utils & Constants
import { cn } from '@/lib/cn';
import { filterStates } from './utils';

interface StateJurisdiction {
  name: string;
  region: string;
  type?: string;
}

export function JurisdictionState() {
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

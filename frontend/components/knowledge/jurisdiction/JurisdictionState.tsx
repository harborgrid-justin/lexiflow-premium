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
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../../services/data/dataService';
import { useQuery } from '../../../hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '../../../utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Badge } from '../../common/Badge';
import { AdaptiveLoader } from '../../common/AdaptiveLoader';
import { SearchToolbar } from '../../common/SearchToolbar';

// Utils & Constants
import { cn } from '../../../utils/cn';
import { filterStates } from './utils';

export const JurisdictionState: React.FC = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');

  // Performance Engine: useQuery
  const { data: rawStates = [], isLoading } = useQuery<any[]>(
      ['jurisdictions', 'state'],
      DataService.jurisdiction.getState
  );

  // Defensive array validation
  const states = Array.isArray(rawStates) ? rawStates : [];
  const filteredStates = filterStates(states, filter);

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={10} shimmer />;

  return (
    <div className="space-y-4">
      <SearchToolbar 
        value={filter} 
        onChange={setFilter} 
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
            <TableRow key={i}>
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



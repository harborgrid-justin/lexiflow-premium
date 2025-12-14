/**
 * @module components/entities/EntityGovernance
 * @category Entity Management - Corporate Governance
 * @description Corporate registry for managing filing status, board composition, and annual reports.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.text, theme.border for consistent theming. Hardcoded slate-900 for header.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { Building2, Calendar, FileCheck } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { LegalEntity } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityGovernanceProps {
  entities: LegalEntity[];
  onSelect: (e: LegalEntity) => void;
}

export const EntityGovernance: React.FC<EntityGovernanceProps> = ({ entities, onSelect }) => {
  const { theme } = useTheme();
  
  const corps = useMemo(() => entities.filter(e => e.type === 'Corporation'), [entities]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("p-4 rounded-lg border shadow-sm bg-slate-900 text-white flex justify-between items-center")}>
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><Building2 className="h-5 w-5"/> Corporate Registry</h3>
                <p className="text-sm text-slate-400">Manage filing status, board composition, and annual reports.</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold">{corps.length}</p>
                <p className="text-xs uppercase font-bold text-slate-500">Entities Tracked</p>
            </div>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Entity Name</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Standing</TableHead>
                <TableHead>Next Filing</TableHead>
                <TableHead>Registered Agent</TableHead>
                <TableHead className="text-right">Docs</TableHead>
            </TableHeader>
            <TableBody>
                {corps.map(corp => (
                    <TableRow key={corp.id} onClick={() => onSelect(corp)} className="cursor-pointer">
                        <TableCell className={cn("font-bold text-sm", theme.text.primary)}>{corp.name}</TableCell>
                        <TableCell>{corp.jurisdiction}</TableCell>
                        <TableCell>
                            <Badge variant={corp.status === 'Active' ? 'success' : 'error'}>
                                {corp.status === 'Active' ? 'Good Standing' : 'Suspended'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                                <Calendar className="h-3 w-3 mr-1"/> Nov 30, 2024
                            </div>
                        </TableCell>
                        <TableCell className={cn("text-xs", theme.text.secondary)}>CSC Lawyers Service</TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" variant="ghost" icon={FileCheck}>View</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    </div>
  );
};
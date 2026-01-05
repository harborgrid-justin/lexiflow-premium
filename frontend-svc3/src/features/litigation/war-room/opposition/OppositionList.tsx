/**
 * @module components/war-room/opposition/OppositionList
 * @category WarRoom
 * @description List view of opposition entities with strategic metrics.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Phone, Mail, MoreHorizontal, TrendingUp, Flame } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { UserAvatar } from '@/components/ui/atoms/UserAvatar';
import { Button } from '@/components/ui/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface OppositionEntity {
  id: string;
  name: string;
  role: string;
  firm: string;
  status: string;
  aggression: 'High' | 'Medium' | 'Low';
  winRate: number;
  tendency: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface OppositionListProps {
  /** Array of opposition entities to display. */
  entities: OppositionEntity[];
  /** Callback when an entity is selected. */
  onSelect: (entity: OppositionEntity) => void;
  /** ID of the currently selected entity. */
  selectedId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const OppositionList: React.FC<OppositionListProps> = ({ entities, onSelect, selectedId }) => {
  const { theme } = useTheme();

  const getAggressionColor = (level: string) => {
      switch(level) {
          case 'High': return 'text-rose-600 bg-rose-50 border-rose-200';
          case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
          default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      }
  };

  return (
    <div className={cn("flex-1 overflow-auto custom-scrollbar p-6", theme.surface.default)}>
        <TableContainer>
            <TableHeader>
                <TableHead>Entity Name</TableHead>
                <TableHead>Role & Firm</TableHead>
                <TableHead>Strategic Profile</TableHead>
                <TableHead>Aggression</TableHead>
                <TableHead>Win Rate (vs Firm)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
                {entities.map(ent => (
                    <TableRow
                        key={ent.id}
                        onClick={() => onSelect(ent)}
                        className={cn("cursor-pointer", selectedId === ent.id ? theme.surface.highlight : "")}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar name={ent.name} size="md" className={ent.role.includes('Counsel') ? 'bg-slate-800 text-white' : ''}/>
                                <div>
                                    <p className={cn("font-bold text-sm", theme.text.primary)}>{ent.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {ent.email && (
                                            <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e: React.MouseEvent) => { e.stopPropagation(); window.location.href=`mailto:${ent.email}`; }}><Mail className="h-3 w-3"/></button>
                                        )}
                                        {ent.phone && (
                                            <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}><Phone className="h-3 w-3"/></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex flex-col")}>
                                <span className={cn("font-medium text-sm", theme.text.primary)}>{ent.role}</span>
                                <span className={cn("text-xs", theme.text.secondary)}>{ent.firm}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={cn("text-xs px-2 py-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                                {ent.tendency}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded w-fit border text-xs font-bold", getAggressionColor(ent.aggression))}>
                                <Flame className="h-3 w-3 fill-current"/>
                                {ent.aggression}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex items-center gap-2 font-mono text-sm", theme.text.primary)}>
                                <TrendingUp className={cn("h-4 w-4", theme.text.tertiary)}/>
                                {ent.winRate}%
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost">Profile</Button>
                                <button className={cn("p-1.5 rounded hover:bg-slate-100", theme.text.secondary)}><MoreHorizontal className="h-4 w-4"/></button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    </div>
  );
};

/**
 * @module components/war-room/advisory/AdvisorList
 * @category WarRoom
 * @description List view of advisors with filtering, sorting, and status indicators.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Phone, Mail, MoreHorizontal, FileText, CheckSquare } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../../providers/ThemeContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/organisms/Table';
import { UserAvatar } from '../../../components/atoms/UserAvatar';
import { Badge } from '../../../components/atoms/Badge';
import { Button } from '../../../components/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface Advisor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: string;
  rate: number;
  email: string;
  phone: string;
  readiness: number;
  reports: number;
}

interface AdvisorListProps {
  /** Array of advisor objects to display. */
  advisors: Advisor[];
  /** Callback when an advisor is selected. */
  onSelect: (advisor: Advisor) => void;
  /** ID of the currently selected advisor. */
  selectedId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdvisorList: React.FC<AdvisorListProps> = ({ advisors, onSelect, selectedId }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex-1 overflow-auto custom-scrollbar p-6", theme.surface.default)}>
        <TableContainer>
            <TableHeader>
                <TableHead>Advisor Name</TableHead>
                <TableHead>Role & Specialty</TableHead>
                <TableHead>Engagement Status</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Rate / Hr</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
                {advisors.map(adv => (
                    <TableRow 
                        key={adv.id} 
                        onClick={() => onSelect(adv)}
                        className={cn("cursor-pointer", selectedId === adv.id ? theme.surface.highlight : "")}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar name={adv.name} size="md"/>
                                <div>
                                    <p className={cn("font-bold text-sm", theme.text.primary)}>{adv.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <button className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`)} onClick={(e: React.MouseEvent) => { e.stopPropagation(); window.location.href=`mailto:${adv.email}`; }}><Mail className="h-3 w-3"/></button>
                                        <button className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`)} onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}><Phone className="h-3 w-3"/></button>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex flex-col")}>
                                <span className={cn("font-medium text-sm", theme.text.primary)}>{adv.role}</span>
                                <span className={cn("text-xs", theme.text.secondary)}>{adv.specialty}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={adv.status === 'Retained' || adv.status === 'Active' ? 'success' : adv.status === 'Pending' ? 'warning' : 'neutral'}>
                                {adv.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="w-24">
                                <div className={cn("flex justify-between text-[10px] mb-1", theme.text.secondary)}>
                                    <span>Trial Prep</span>
                                    <span className="font-bold">{adv.readiness}%</span>
                                </div>
                                <div className={cn("w-full rounded-full h-1.5 border", theme.surface.highlight, theme.border.default)}>
                                    <div className={cn("h-full rounded-full transition-all", adv.readiness === 100 ? "bg-emerald-500" : theme.primary.DEFAULT)} style={{ width: `${adv.readiness}%` }}></div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={cn("font-mono font-medium", theme.text.primary)}>${adv.rate}</span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" icon={CheckSquare} title="Tasks"/>
                                <Button size="sm" variant="ghost" icon={FileText} title="Reports">
                                    {adv.reports > 0 && <span className={cn("ml-1 text-[10px] px-1.5 rounded-full", theme.primary.light, theme.primary.text)}>{adv.reports}</span>}
                                </Button>
                                <button className={cn("p-1.5 rounded transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}><MoreHorizontal className="h-4 w-4"/></button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    </div>
  );
};

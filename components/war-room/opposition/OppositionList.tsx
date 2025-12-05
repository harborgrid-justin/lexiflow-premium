
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { UserAvatar } from '../../common/UserAvatar';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { Phone, Mail, MoreHorizontal, TrendingUp, Flame } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

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
  entities: OppositionEntity[];
  onSelect: (entity: OppositionEntity) => void;
  selectedId?: string;
}

export const OppositionList: React.FC<OppositionListProps> = ({ entities, onSelect, selectedId }) => {
  const { theme } = useTheme();

  const getAggressionColor = (level: string) => {
      switch(level) {
          case 'High': return 'text-red-600 bg-red-50 border-red-200';
          case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
          default: return 'text-green-600 bg-green-50 border-green-200';
      }
  };

  return (
    <div className={cn("flex-1 overflow-auto custom-scrollbar p-6", theme.surface)}>
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
                        className={cn("cursor-pointer", selectedId === ent.id ? theme.surfaceHighlight : "")}
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <UserAvatar name={ent.name} size="md" className={ent.role.includes('Counsel') ? 'bg-slate-800 text-white' : ''}/>
                                <div>
                                    <p className={cn("font-bold text-sm", theme.text.primary)}>{ent.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {ent.email && (
                                            <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e) => { e.stopPropagation(); window.location.href=`mailto:${ent.email}`; }}><Mail className="h-3 w-3"/></button>
                                        )}
                                        {ent.phone && (
                                            <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e) => { e.stopPropagation(); }}><Phone className="h-3 w-3"/></button>
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
                            <span className={cn("text-xs px-2 py-1 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
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
                                <TrendingUp className="h-4 w-4 text-slate-400"/>
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

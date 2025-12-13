
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { UserAvatar } from '../../common/UserAvatar';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { Phone, Mail, MoreHorizontal, FileText, CheckSquare } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

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
  advisors: Advisor[];
  onSelect: (advisor: Advisor) => void;
  selectedId?: string;
}

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
                                        <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e) => { e.stopPropagation(); window.location.href=`mailto:${adv.email}`; }}><Mail className="h-3 w-3"/></button>
                                        <button className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)} onClick={(e) => { e.stopPropagation(); }}><Phone className="h-3 w-3"/></button>
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
                                <div className={cn("w-full rounded-full h-1.5", theme.surface.highlight, "border border-slate-200")}>
                                    <div className={cn("h-full rounded-full transition-all", adv.readiness === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${adv.readiness}%` }}></div>
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
                                    {adv.reports > 0 && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full">{adv.reports}</span>}
                                </Button>
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

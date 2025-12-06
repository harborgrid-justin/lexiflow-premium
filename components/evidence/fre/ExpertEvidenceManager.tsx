import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { UserCheck, FileText, Gavel, ShieldAlert } from 'lucide-react';
import { useQuery } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { STORES } from '../../../services/db';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export const ExpertEvidenceManager: React.FC = () => {
    const { theme } = useTheme();
    const { data: experts = [] } = useQuery<any[]>(
        [STORES.ADVISORS, 'experts'],
        DataService.warRoom.getExperts
    );

    return (
        <div className="space-y-6">
             <div className={cn("p-4 rounded-lg border flex items-start gap-3", theme.status.info.bg, theme.status.info.border, theme.status.info.text)}>
                <UserCheck className="h-5 w-5 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="font-bold text-sm">FRE 702: Testimony by Expert Witnesses</h4>
                    <p className="text-xs mt-1">Manage Daubert/Frye challenges, expert reports, and the evidence relied upon by each expert witness.</p>
                </div>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Expert Witness</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Reports Filed</TableHead>
                    <TableHead>Daubert Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {experts.map(expert => (
                         <TableRow key={expert.id}>
                            <TableCell className={cn("font-medium", theme.text.primary)}>{expert.name}</TableCell>
                            <TableCell>{expert.specialty}</TableCell>
                            <TableCell>
                                <span className="flex items-center gap-1 text-xs">
                                    <FileText className="h-3 w-3"/>
                                    {expert.reports} Reports
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={expert.id === 'exp-1' ? 'warning' : 'success'}>
                                    {expert.id === 'exp-1' ? 'Challenged' : 'Qualified'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" icon={Gavel}>Manage Challenges</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};
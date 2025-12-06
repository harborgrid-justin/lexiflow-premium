
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../common/Table';
import { UserAvatar } from '../../../common/UserAvatar';
import { Badge } from '../../../common/Badge';
import { Button } from '../../../common/Button';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

export const AccessGovernance: React.FC = () => {
    const { theme } = useTheme();

    const assignments = [
        { id: 1, user: 'James Doe', role: 'Associate', resource: 'Billing Database', permission: 'Write', risk: 'Medium', lastReview: '30 days ago' },
        { id: 2, user: 'Sarah Jenkins', role: 'Paralegal', resource: 'HR Records', permission: 'Read', risk: 'High', lastReview: 'Overdue' },
        { id: 3, user: 'Alexandra H.', role: 'Partner', resource: 'Admin Console', permission: 'Full', risk: 'Critical', lastReview: '7 days ago' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-4 border rounded-lg flex items-center justify-between", theme.surface, theme.border.default)}>
                <div>
                    <h4 className={cn("font-bold text-sm", theme.text.primary)}>Quarterly Access Review</h4>
                    <p className={cn("text-xs mt-1", theme.text.secondary)}>Cycle Q1 2024 • 12/45 Reviews Completed</p>
                </div>
                <Button variant="primary">Start Review</Button>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableHeader>
                <TableBody>
                    {assignments.map(a => (
                        <TableRow key={a.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={a.user} size="sm"/>
                                    <div>
                                        <div className={cn("text-sm font-medium", theme.text.primary)}>{a.user}</div>
                                        <div className={cn("text-xs", theme.text.secondary)}>{a.role}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{a.resource}</TableCell>
                            <TableCell><span className="font-mono text-xs">{a.permission}</span></TableCell>
                            <TableCell>
                                <Badge variant={a.risk === 'Critical' || a.risk === 'High' ? 'error' : 'warning'}>
                                    {a.risk}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={cn("text-xs flex items-center", a.lastReview === 'Overdue' ? "text-red-500 font-bold" : theme.text.secondary)}>
                                    {a.lastReview === 'Overdue' && <AlertTriangle className="h-3 w-3 mr-1"/>}
                                    {a.lastReview}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="h-4 w-4"/></button>
                                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Revoke"><XCircle className="h-4 w-4"/></button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};

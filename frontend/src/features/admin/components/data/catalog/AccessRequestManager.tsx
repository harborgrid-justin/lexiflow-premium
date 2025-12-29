
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms';
import { Badge } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

export const AccessRequestManager: React.FC = () => {
    const { theme } = useTheme();

    const requests = [
        { id: 1, user: 'John Doe', dataset: 'Financial Records Q1', purpose: 'Audit Preparation', date: '2h ago', status: 'Pending' },
        { id: 2, user: 'Jane Smith', dataset: 'Client Metadata', purpose: 'Marketing Campaign', date: '5h ago', status: 'Approved' },
        { id: 3, user: 'Mike Brown', dataset: 'HR Salaries', purpose: 'Invalid', date: '1d ago', status: 'Rejected' },
    ];

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className={cn("p-4 border rounded-lg flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <h4 className={cn("font-bold", theme.text.primary)}>Pending Requests</h4>
                <Badge variant="warning">{requests.filter(r => r.status === 'Pending').length} Pending</Badge>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>User</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>Request Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {requests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <User className={cn("h-4 w-4", theme.text.tertiary)}/>
                                    <span className={cn("font-medium", theme.text.primary)}>{req.user}</span>
                                </div>
                            </TableCell>
                            <TableCell>{req.dataset}</TableCell>
                            <TableCell className={cn("text-xs italic", theme.text.secondary)}>{req.purpose}</TableCell>
                            <TableCell>
                                <span className={cn("flex items-center text-xs", theme.text.tertiary)}>
                                    <Clock className="h-3 w-3 mr-1"/> {req.date}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}>
                                    {req.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {req.status === 'Pending' && (
                                    <div className="flex justify-end gap-1">
                                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="h-4 w-4"/></button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle className="h-4 w-4"/></button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};

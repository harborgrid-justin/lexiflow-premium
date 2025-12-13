import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CheckSquare, Plus, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { DiscoveryRequest } from '../../types';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const RequestForAdmission: React.FC = () => {
  const { theme } = useTheme();

  // Reuse requests store but filter for Admissions
  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, 'all'],
      DataService.discovery.getRequests
  );

  const rfas = requests.filter(r => r.type === 'Admission');

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                    <CheckSquare className="h-5 w-5 mr-2 text-purple-600"/> Requests for Admission (Rule 36)
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Conclusively establish facts before trial.</p>
            </div>
            <Button variant="primary" icon={Plus}>New RFA Set</Button>
        </div>

        <div className={cn("p-4 rounded-lg border bg-amber-50 border-amber-200 flex items-start gap-3")}>
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5"/>
            <div className="text-sm text-amber-900">
                <strong>Warning:</strong> Failure to respond within 30 days results in automatic admission of the matter requested. (Rule 36(a)(3))
            </div>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Title</TableHead>
                <TableHead>Target Party</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Response</TableHead>
            </TableHeader>
            <TableBody>
                {rfas.map(req => (
                    <TableRow key={req.id}>
                        <TableCell className={cn("font-medium", theme.text.primary)}>{req.title}</TableCell>
                        <TableCell>{req.respondingParty}</TableCell>
                        <TableCell className={cn("font-mono", theme.text.secondary)}>{req.dueDate}</TableCell>
                        <TableCell>
                            <Badge variant={req.status === 'Responded' ? 'success' : req.status === 'Overdue' ? 'error' : 'warning'}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" variant="ghost">View Response</Button>
                        </TableCell>
                    </TableRow>
                ))}
                {rfas.length === 0 && (
                    <TableRow><TableCell colSpan={5} className={cn("text-center py-8 italic", theme.text.tertiary)}>No RFA sets found.</TableCell></TableRow>
                )}
            </TableBody>
        </TableContainer>
    </div>
  );
};

export default RequestForAdmission;
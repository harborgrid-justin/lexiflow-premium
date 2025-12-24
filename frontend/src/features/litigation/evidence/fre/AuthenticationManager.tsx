/**
 * @module AuthenticationManager
 * @category Evidence
 * @description Manages evidence authentication status under FRE 901/902.
 * Tracks self-authenticating documents, testimony requirements, and stipulations.
 */

import React from 'react';
import { Fingerprint, CheckCircle, MessageSquare, AlertTriangle, Send } from 'lucide-react';

// Common Components
import { MetricCard } from '../../../common/Primitives';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../common/Table';
import { Badge } from '../../../common/Badge';
import { Button } from '../../../common/Button';

// Context & Utils
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';

// Services & Types
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { EvidenceItem } from '../../../../types';

export const AuthenticationManager: React.FC = () => {
    const { theme } = useTheme();
    const { data: evidence = [] } = useQuery<EvidenceItem[]>(
        ['evidence', 'all'],
        () => DataService.evidence.getAll()
    );

    const stats = {
        selfAuthenticating: evidence.filter(e => e.authenticationMethod === 'Self-Authenticated').length,
        needsTestimony: evidence.filter(e => e.authenticationMethod === 'Testimony').length,
        stipulated: evidence.filter(e => e.authenticationMethod === 'Stipulation').length,
        pending: evidence.filter(e => e.authenticationMethod === 'Pending').length,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Self-Authenticating (FRE 902)" value={stats.selfAuthenticating} icon={CheckCircle} className="border-l-4 border-l-green-500"/>
                <MetricCard label="Needs Testimony (FRE 901)" value={stats.needsTestimony} icon={MessageSquare} className="border-l-4 border-l-blue-500"/>
                <MetricCard label="Stipulated" value={stats.stipulated} icon={CheckCircle} className="border-l-4 border-l-purple-500"/>
                <MetricCard label="Pending Review" value={stats.pending} icon={AlertTriangle} className="border-l-4 border-l-amber-500"/>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Evidence ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Authentication Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableHeader>
                <TableBody>
                    {evidence.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className={cn("font-mono", theme.text.secondary)}>{item.id}</TableCell>
                            <TableCell className={cn("font-medium", theme.text.primary)}>{item.title}</TableCell>
                            <TableCell>
                                <select title="Select authentication method" className={cn("text-xs p-1 border rounded", theme.surface.default, theme.border.default)}>
                                    <option>Pending</option>
                                    <option>Self-Authenticated</option>
                                    <option>Testimony</option>
                                    <option>Stipulation</option>
                                </select>
                            </TableCell>
                            <TableCell>
                                <Badge variant={item.authenticationMethod === 'Self-Authenticated' ? 'success' : 'neutral'}>
                                    {item.authenticationMethod === 'Pending' ? 'Needs Review' : 'Verified'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" icon={Send}>Request Stipulation</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};

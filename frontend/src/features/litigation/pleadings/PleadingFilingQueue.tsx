/**
 * @module components/pleading/PleadingFilingQueue
 * @category Pleadings
 * @description E-filing queue management with status tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';

// Components
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { EmptyState } from '../../components/molecules/EmptyState';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/organisms/Table';

// Services & Utils
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/utils/cn';

// Types
import { PleadingDocument } from '../../../types';

// ============================================================================
// COMPONENT
// ============================================================================

interface FilingQueueItem extends PleadingDocument {
    filingStatus?: 'pending' | 'filed' | 'failed' | 'scheduled';
    scheduledDate?: string;
    court?: string;
}

export const PleadingFilingQueue: React.FC = () => {
    const { theme } = useTheme();
    const notify = useNotify();

    const { data: pleadings = [] } = useQuery<PleadingDocument[]>(
        ['pleadings', 'filing-queue'],
        async () => {
            const all = await DataService.pleadings.getAll();
            // Filter for finalized pleadings ready for filing
            return all.filter((p: PleadingDocument) => 
                p.status === 'Finalized' || p.status === 'Filed'
            );
        }
    );

    const { mutate: submitFiling } = useMutation(
        async (pleadingId: string) => {
            const existing = pleadings.find(p => p.id === pleadingId);
            if (!existing) throw new Error('Pleading not found');
            // Simulate e-filing submission
            return DataService.pleadings.update(pleadingId, { status: 'Filed' });
        },
        {
            invalidateKeys: [['pleadings']],
            onSuccess: () => notify.success('Filing submitted successfully'),
            onError: () => notify.error('Failed to submit filing')
        }
    );

    const getFilingStatus = (item: FilingQueueItem) => {
        if (item.status === 'Filed') return 'filed';
        if (item.filingStatus) return item.filingStatus;
        return 'pending';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'filed':
                return <Badge variant="success" icon={CheckCircle}>Filed</Badge>;
            case 'pending':
                return <Badge variant="warning" icon={Clock}>Pending</Badge>;
            case 'failed':
                return <Badge variant="error" icon={XCircle}>Failed</Badge>;
            case 'scheduled':
                return <Badge variant="info" icon={Clock}>Scheduled</Badge>;
            default:
                return <Badge variant="neutral">Unknown</Badge>;
        }
    };

    if (pleadings.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <EmptyState 
                    icon={Send}
                    title="Filing Queue is Empty"
                    description="Finalized pleadings ready for e-filing will appear here."
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn("text-2xl font-bold", theme.text.primary)}>E-Filing Queue</h2>
                    <p className={cn("text-sm", theme.text.secondary)}>
                        {pleadings.length} pleading(s) ready for filing
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        icon={Send}
                        onClick={() => notify.info('Batch filing feature coming soon')}
                    >
                        Submit All
                    </Button>
                </div>
            </div>

            {/* Filing Queue Table */}
            <div className="flex-1 overflow-hidden">
                <TableContainer>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Case</TableHead>
                            <TableHead>Court</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pleadings.map((item: any) => {
                            const status = getFilingStatus(item as FilingQueueItem);
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Send className={cn("h-4 w-4", theme.text.secondary)} />
                                            <span className={cn("font-medium", theme.text.primary)}>
                                                {item.title}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={theme.text.secondary}>
                                        {item.caseId || 'N/A'}
                                    </TableCell>
                                    <TableCell className={theme.text.secondary}>
                                        {(item as FilingQueueItem).court || 'Not specified'}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    icon={Send}
                                                    onClick={() => submitFiling(item.id)}
                                                >
                                                    File Now
                                                </Button>
                                            )}
                                            {status === 'filed' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => notify.info('View filing confirmation')}
                                                >
                                                    View Confirmation
                                                </Button>
                                            )}
                                            {status === 'failed' && (
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    icon={AlertTriangle}
                                                    onClick={() => submitFiling(item.id)}
                                                >
                                                    Retry
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </TableContainer>
            </div>
        </div>
    );
};


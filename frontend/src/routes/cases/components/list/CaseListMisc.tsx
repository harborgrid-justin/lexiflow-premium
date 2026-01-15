/**
 * @module components/case-list/CaseListMisc
 * @category Case Management
 * @description Miscellaneous case operations: archival, bulk actions, transfers.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Archive, CheckSquare, Download, FolderInput, RefreshCw, Upload } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';
import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';

// Components
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { Tabs } from '@/components/molecules/Tabs/Tabs';

// Services & Utils
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/lib/cn';

// Types
import { Case } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const CaseListMisc: React.FC = () => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [activeTab, setActiveTab] = useState('archive');
    const [selectedCases, setSelectedCases] = useState<string[]>([]);

    // Fetch cases for different operations
    const { data: activeCases = [] } = useQuery<Case[]>(
        ['cases', 'active'],
        async () => {
            const all = await DataService.cases.getAll();
            return all.filter((c: Case) => c.status !== 'Closed' && c.status !== 'Archived');
        }
    );

    const { data: archivedCases = [] } = useQuery<Case[]>(
        ['cases', 'archived'],
        async () => {
            const all = await DataService.cases.getAll();
            return all.filter((c: Case) => c.status === 'Archived');
        }
    );

    // Archive mutation
    const { mutate: archiveCase } = useMutation(
        async (caseId: string) => {
            const existing = activeCases.find(c => c.id === caseId);
            if (!existing) throw new Error('Case not found');
            return DataService.cases.update(caseId, { status: 'Archived' });
        },
        {
            invalidateKeys: [['cases']],
            onSuccess: () => notify.success('Case archived successfully'),
            onError: () => notify.error('Failed to archive case')
        }
    );

    // Restore mutation
    const { mutate: restoreCase } = useMutation(
        async (caseId: string) => {
            const existing = archivedCases.find(c => c.id === caseId);
            if (!existing) throw new Error('Case not found');
            return DataService.cases.update(caseId, { status: 'Active' });
        },
        {
            invalidateKeys: [['cases']],
            onSuccess: () => notify.success('Case restored successfully'),
            onError: () => notify.error('Failed to restore case')
        }
    );

    const handleBulkArchive = () => {
        if (selectedCases.length === 0) {
            notify.warning('No cases selected');
            return;
        }
        selectedCases.forEach(caseId => archiveCase(caseId));
        setSelectedCases([]);
    };

    const handleExport = () => {
        notify.info('Export functionality coming soon');
    };

    const handleImport = () => {
        notify.info('Import functionality coming soon');
    };

    return (
        <div className="flex flex-col h-full space-y-6 p-6">
            {/* Header */}
            <div>
                <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Case Operations</h2>
                <p className={cn("text-sm", theme.text.secondary)}>Archive, bulk actions, and case transfers</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    label="Active Cases"
                    value={activeCases.length}
                    icon={CheckSquare}
                    className="border-l-4 border-l-blue-600"
                />
                <MetricCard
                    label="Archived Cases"
                    value={archivedCases.length}
                    icon={Archive}
                    className="border-l-4 border-l-slate-500"
                />
                <MetricCard
                    label="Selected"
                    value={selectedCases.length}
                    icon={FolderInput}
                    className="border-l-4 border-l-purple-600"
                />
            </div>

            {/* Tabs */}
            <Tabs
                tabs={[
                    { id: 'archive', label: 'Archive', icon: Archive },
                    { id: 'bulk', label: 'Bulk Actions', icon: CheckSquare },
                    { id: 'transfer', label: 'Transfers', icon: FolderInput },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'archive' && (
                    <div className="space-y-4">
                        <Card title="Archive Cases">
                            <div className="space-y-3">
                                {activeCases.slice(0, 10).map(c => (
                                    <div
                                        key={c.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded border",
                                            theme.border.default,
                                            theme.surface.default
                                        )}
                                    >
                                        <div>
                                            <div className={cn("font-medium", theme.text.primary)}>{c.title}</div>
                                            <div className={cn("text-sm", theme.text.secondary)}>{c.caseNumber}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            icon={Archive}
                                            onClick={() => archiveCase(c.id)}
                                        >
                                            Archive
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Archived Cases">
                            <div className="space-y-3">
                                {archivedCases.slice(0, 10).map(c => (
                                    <div
                                        key={c.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded border",
                                            theme.border.default,
                                            theme.surface.default
                                        )}
                                    >
                                        <div>
                                            <div className={cn("font-medium", theme.text.primary)}>{c.title}</div>
                                            <div className={cn("text-sm", theme.text.secondary)}>{c.caseNumber}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            icon={RefreshCw}
                                            onClick={() => restoreCase(c.id)}
                                        >
                                            Restore
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <Card title="Bulk Operations">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button icon={Archive} onClick={handleBulkArchive}>
                                    Archive Selected
                                </Button>
                                <Button icon={Download} onClick={handleExport}>
                                    Export
                                </Button>
                                <Button icon={Upload} onClick={handleImport}>
                                    Import
                                </Button>
                            </div>
                            <div className={cn("text-sm", theme.text.secondary)}>
                                {selectedCases.length} case(s) selected
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'transfer' && (
                    <Card title="Case Transfers">
                        <div className={cn("text-center py-8", theme.text.secondary)}>
                            Case transfer functionality - assign cases to different attorneys or firms
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CaseListMisc;

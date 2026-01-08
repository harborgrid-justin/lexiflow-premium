/**
 * @module components/practice/VendorProcurement
 * @category Practice Management
 * @description Vendor directory, contract lifecycle, and RFP management.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { BarChart2, Briefcase, FileText, Loader2, Plus, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import SpendAnalyticsChart from './SpendAnalyticsChart';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/providers';

// Components
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/components/features/cases/components/Kanban/Kanban';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

interface VendorDirectory {
    id: string;
    name: string;
    category: string;
    rating: number;
    status: string;
}

interface VendorContract {
    id: string;
    vendor: string;
    type: string;
    value: string;
    renewal: string;
    status: string;
}

interface RFP {
    id: string;
    title: string;
    budget: string;
    stage: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const VendorProcurement: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('directory');

    const { data: contracts = [], isLoading: contractsLoading } = useQuery<VendorContract[]>(
        ['vendor-contracts', 'all'],
        DataService.operations.getVendorContracts
    );

    const { data: rfps = [], isLoading: rfpsLoading } = useQuery<RFP[]>(
        ['rfps', 'all'],
        DataService.operations.getRfps
    );

    const { data: directory = [], isLoading: directoryLoading } = useQuery<VendorDirectory[]>(
        ['vendor-directory', 'all'],
        DataService.operations.getVendorDirectory
    );

    const isLoading = contractsLoading || rfpsLoading || directoryLoading;

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Procurement & Contracts</h3>
                    <Button variant="primary" icon={Plus}>New Requisition</Button>
                </div>
                <Tabs
                    tabs={[
                        { id: 'directory', label: 'Vendor Directory', icon: Briefcase },
                        { id: 'contracts', label: 'Contract Lifecycle', icon: FileText },
                        { id: 'rfp', label: 'RFP Pipeline', icon: ShoppingCart },
                        { id: 'spend', label: 'Spend Analysis', icon: BarChart2 },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="flex-1 overflow-hidden p-6">
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div>}

                {!isLoading && activeTab === 'directory' && (
                    <div className="space-y-4 animate-fade-in">
                        <SearchToolbar value="" onChange={() => { }} placeholder="Search vendors..." />
                        <TableContainer>
                            <TableHeader><TableHead>Vendor</TableHead><TableHead>Category</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead></TableHeader>
                            <TableBody>
                                {directory.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className={cn("font-bold", theme.text.primary)}>{v.name}</TableCell>
                                        <TableCell>{v.category}</TableCell>
                                        <TableCell>{v.rating}/5</TableCell>
                                        <TableCell><Badge variant={v.status === 'Preferred' ? 'success' : v.status === 'Active' ? 'info' : 'neutral'}>{v.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableContainer>
                    </div>
                )}

                {!isLoading && activeTab === 'contracts' && (
                    <div className="space-y-4 animate-fade-in">
                        <TableContainer>
                            <TableHeader><TableHead>Vendor</TableHead><TableHead>Service Type</TableHead><TableHead>Value</TableHead><TableHead>Renewal Date</TableHead><TableHead>Status</TableHead></TableHeader>
                            <TableBody>
                                {contracts.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className={cn("font-medium", theme.text.primary)}>{c.vendor}</TableCell>
                                        <TableCell>{c.type}</TableCell>
                                        <TableCell className="font-mono">{c.value}</TableCell>
                                        <TableCell>{c.renewal}</TableCell>
                                        <TableCell><Badge variant={c.status === 'Active' ? 'success' : 'warning'}>{c.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableContainer>
                    </div>
                )}

                {!isLoading && activeTab === 'rfp' && (
                    <KanbanBoard>
                        {['Drafting', 'Published', 'Vendor Selection', 'Contract Negotiation', 'Closed'].map(stage => (
                            <KanbanColumn key={stage} title={stage} count={rfps.filter(r => r.stage === stage).length}>
                                {rfps.filter(r => r.stage === stage).map(r => (
                                    <KanbanCard key={r.id}>
                                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>{r.title}</h4>
                                        <p className={cn("text-xs mt-1", theme.text.secondary)}>Budget: {r.budget}</p>
                                    </KanbanCard>
                                ))}
                            </KanbanColumn>
                        ))}
                    </KanbanBoard>
                )}

                {!isLoading && activeTab === 'spend' && (
                    <SpendAnalyticsChart />
                )}
            </div>
        </div>
    );
};

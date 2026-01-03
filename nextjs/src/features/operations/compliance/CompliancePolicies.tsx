import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { Calendar, Download, Eye, FileText } from 'lucide-react';
import { memo } from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { useWindow } from '@/providers';
import { DocumentPreviewPanel } from '../documents/viewer/DocumentPreviewPanel';

interface PolicyItem {
    id: string;
    title: string;
    version: string;
    date: string;
    status: string;
}

const CompliancePoliciesComponent = () => {
    const { theme } = useTheme();
    const { openWindow } = useWindow();

    // Performance Engine: Caching
    const { data: policies = [], isLoading } = useQuery<PolicyItem[]>(
        ['policies', 'all'],
        DataService.compliance.getPolicies
    );

    const handleViewPolicy = (policy: PolicyItem) => {
        const winId = `policy-${policy.id}`;
        openWindow(
            winId,
            `Policy: ${policy.title}`,
            <div className="h-full bg-white">
                <DocumentPreviewPanel
                    document={{
                        id: policy.id as import('@/types').DocumentId,
                        title: policy.title,
                        type: 'Policy',
                        content: 'Policy Content Preview...',
                        uploadDate: policy.date,
                        lastModified: policy.date,
                        tags: ['Compliance', 'Policy'],
                        versions: [],
                        caseId: 'General' as import('@/types').CaseId,
                        status: policy.status
                    }}
                    onViewHistory={() => { }}
                    isOrbital={true}
                />
            </div>
        );
    };

    if (isLoading) return <AdaptiveLoader contentType="list" shimmer itemCount={5} />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("flex justify-between items-start p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>Regulatory Policies</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Firm-wide compliance documents and SOPs.</p>
                </div>
                <Button variant="outline">Upload New Version</Button>
            </div>

            <TableContainer responsive="card">
                <TableHeader>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {policies.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded bg-blue-50 text-blue-600")}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className={cn("font-medium", theme.text.primary)}>{p.title}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={cn("font-mono text-xs", theme.text.secondary)}>v{p.version}</span>
                            </TableCell>
                            <TableCell>
                                <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                                    <Calendar className="h-3 w-3 mr-1" /> {p.date}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={p.status === 'Active' ? 'success' : 'warning'}>{p.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" icon={Eye} onClick={() => handleViewPolicy(p)}>View</Button>
                                    <Button size="sm" variant="ghost" icon={Download}>PDF</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
}

export const CompliancePolicies = memo(CompliancePoliciesComponent);
CompliancePolicies.displayName = 'CompliancePolicies';

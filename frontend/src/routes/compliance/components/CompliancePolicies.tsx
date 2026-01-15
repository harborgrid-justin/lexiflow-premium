import { useWindow } from '@/providers';
import { DocumentPreviewPanel } from '@/routes/documents/components/viewer/DocumentPreviewPanel';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader/AdaptiveLoader';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { useTheme } from '@/contexts/ThemeContext';
import { CaseId, DocumentId } from '@/types';
import { Calendar, FileText, ShieldAlert } from 'lucide-react';
import { memo } from 'react';
import { PolicyItem, useCompliancePolicies } from './hooks/useCompliancePolicies';

export const CompliancePolicies = memo(() => {
    const { theme } = useTheme();
    const { openWindow } = useWindow();

    const [{ policies, status }, { refresh }] = useCompliancePolicies();

    const handleViewPolicy = (policy: PolicyItem) => {
        const winId = `policy-${policy.id}`;
        openWindow(
            winId,
            `Policy: ${policy.title}`,
            <div style={{ backgroundColor: 'var(--color-surface)' }} className="h-full">
                <DocumentPreviewPanel
                    document={{
                        id: policy.id as DocumentId,
                        title: policy.title,
                        type: 'Policy',
                        content: 'Policy Content Preview...',
                        uploadDate: policy.date,
                        lastModified: policy.date,
                        tags: ['Compliance', 'Policy'],
                        versions: [],
                        caseId: 'General' as CaseId,
                        status: policy.status
                    }}
                    onViewHistory={() => { }}
                    isOrbital={true}
                />
            </div>
        );
    };

    if (status === 'loading') return <AdaptiveLoader contentType="list" shimmer itemCount={5} />;

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <p className="text-red-500">Failed to load policies</p>
                <Button onClick={refresh} variant="primary">Retry</Button>
            </div>
        );
    }

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
                                <Button size="sm" variant="ghost" onClick={() => handleViewPolicy(p)}>
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
});

CompliancePolicies.displayName = 'CompliancePolicies';

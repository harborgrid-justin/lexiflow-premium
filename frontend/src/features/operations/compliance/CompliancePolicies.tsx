
import React from 'react';
import { FileText, Download, Eye, Calendar, Loader2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { useWindow } from '@/providers/WindowContext';
import { DocumentPreviewPanel } from '../documents/viewer/DocumentPreviewPanel';
import { ActionRow } from '@/components/organisms/_legacy/RefactoredCommon';

interface PolicyItem {
  id: string;
  title: string;
  version: string;
  date: string;
  status: string;
}

export const CompliancePolicies: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  
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
                      id: policy.id, 
                      title: policy.title, 
                      type: 'Policy', 
                      content: 'Policy Content Preview...', 
                      uploadDate: policy.date, 
                      lastModified: policy.date, 
                      tags: ['Compliance', 'Policy'], 
                      versions: [], 
                      caseId: 'General',
                      status: policy.status 
                  }} 
                  onViewHistory={() => {}}
                  isOrbital={true}
              />
          </div>
      );
  };

  if (isLoading) return <AdaptiveLoader contentType="list" shimmer itemCount={5} />;

  return (
    <div className="space-y-6 animate-fade-in">
        <ActionRow 
            title="Regulatory Policies" 
            subtitle="Firm-wide compliance documents and SOPs."
        >
            <Button variant="outline">Upload New Version</Button>
        </ActionRow>

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
                                    <FileText className="h-4 w-4"/>
                                </div>
                                <span className={cn("font-medium", theme.text.primary)}>{p.title}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={cn("font-mono text-xs", theme.text.secondary)}>v{p.version}</span>
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex items-center text-xs", theme.text.secondary)}>
                                <Calendar className="h-3 w-3 mr-1"/> {p.date}
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
};



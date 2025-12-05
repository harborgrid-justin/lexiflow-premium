
import React from 'react';
import { FileText, Download, Eye, Calendar, Loader2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useWindow } from '../../context/WindowContext';
import { DocumentPreviewPanel } from '../document/DocumentPreviewPanel';

export const CompliancePolicies: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  
  // Performance Engine: Caching
  const { data: policies = [], isLoading } = useQuery<any[]>(
      [STORES.POLICIES, 'all'],
      DataService.compliance.getPolicies
  );

  const handleViewPolicy = (policy: any) => {
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

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Regulatory Policies</h3>
                <p className={cn("text-sm", theme.text.secondary)}>Firm-wide compliance documents and SOPs.</p>
            </div>
            <Button variant="outline">Upload New Version</Button>
        </div>

        <TableContainer>
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

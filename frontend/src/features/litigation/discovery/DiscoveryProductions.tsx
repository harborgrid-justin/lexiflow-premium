/**
 * @module components/discovery/DiscoveryProductions
 * @category Discovery
 * @description Production set management with document tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Package, Download, Plus, FileText, Share2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useWindow } from '@/providers/WindowContext';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms';
import { Badge } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { DiscoveryProduction } from './DiscoveryProduction';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { ProductionSet } from '@/types';
import { DiscoveryProductionsProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================
export const DiscoveryProductions: React.FC<DiscoveryProductionsProps> = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();

  // Enterprise Data Access
  const { data: productions = [] } = useQuery<ProductionSet[]>(
      ['discovery-productions', 'all'],
      () => DataService.discovery.getProductions()
  );

  const { mutate: downloadVolume, isLoading: _isDownloading } = useMutation(
      DataService.discovery.downloadProduction,
      {
          onSuccess: (url) => {
              window.open(url as string, '_blank');
              notify.success("Download started.");
          }
      }
  );

  const handleShare = (id: string) => {
      // In a real app, this would call a share dialog mutation
      notify.info(`Secure link generated for production ${id}`);
  };

  const handleCreateProduction = () => {
      const winId = `prod-wizard-${Date.now()}`;
      openWindow(
          winId,
          'Production Wizard',
          <DiscoveryProduction 
            request={null} 
            onBack={() => closeWindow(winId)}
          />
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                    <Package className="h-5 w-5 mr-2 text-green-600"/> Production History
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Log of all outgoing document volumes.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={handleCreateProduction}>Create Production</Button>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Volume Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Bates Range</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableHeader>
            <TableBody>
                {productions.map(prod => (
                    <TableRow key={prod.id}>
                        <TableCell>
                            <div className="flex items-center">
                                <FileText className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                                <span className={cn("font-medium", theme.text.primary)}>{prod.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{prod.date}</TableCell>
                        <TableCell><span className={cn("font-mono text-xs px-1.5 py-0.5 rounded border", theme.surface.highlight, theme.border.default)}>{prod.batesRange}</span></TableCell>
                        <TableCell className={cn("text-xs", theme.text.secondary)}>{prod.docCount} docs ({prod.size})</TableCell>
                        <TableCell>{prod.format}</TableCell>
                        <TableCell>
                            <Badge variant={prod.status === 'Delivered' ? 'success' : prod.status === 'Staging' ? 'warning' : 'neutral'}>
                                {prod.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" icon={Share2} onClick={() => handleShare(prod.id)}>Share</Button>
                                <Button size="sm" variant="outline" icon={Download} onClick={() => downloadVolume(prod.id)}>Download</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {productions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className={cn("text-center py-8 italic", theme.text.tertiary)}>No productions logged yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </TableContainer>
    </div>
  );
};

export default DiscoveryProductions;


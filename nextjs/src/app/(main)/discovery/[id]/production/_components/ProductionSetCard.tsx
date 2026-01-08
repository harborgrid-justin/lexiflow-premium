'use client';

/**
 * Production Set Card Component
 * Displays a production set with status and actions
 */

import { useState, useTransition } from 'react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import {
  FileText,
  Download,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Settings,
  Eye,
  Trash2,
} from 'lucide-react';
import { updateProductionStatus, exportProduction, runProductionQC } from '../../../_actions';
import type { ProductionSet, ProductionStatusValue } from '../../../_types';

interface ProductionSetCardProps {
  productionSet: ProductionSet;
  onUpdate?: () => void;
}

const statusConfig: Record<ProductionStatusValue, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon: React.ReactNode;
}> = {
  draft: { label: 'Draft', variant: 'default', icon: <FileText className="h-4 w-4" /> },
  in_progress: { label: 'In Progress', variant: 'info', icon: <Clock className="h-4 w-4" /> },
  qc_pending: { label: 'QC Pending', variant: 'warning', icon: <AlertTriangle className="h-4 w-4" /> },
  qc_complete: { label: 'QC Complete', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  produced: { label: 'Produced', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  delivered: { label: 'Delivered', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
};

export function ProductionSetCard({ productionSet, onUpdate }: ProductionSetCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  const status = statusConfig[productionSet.status];
  const progress = productionSet.documentCount > 0
    ? Math.round((productionSet.processedCount / productionSet.documentCount) * 100)
    : 0;

  const handleRunQC = () => {
    startTransition(async () => {
      await runProductionQC(productionSet.id);
      setShowMenu(false);
      onUpdate?.();
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      await exportProduction(productionSet.id, 'native');
      setShowMenu(false);
    });
  };

  const handleUpdateStatus = (newStatus: ProductionStatusValue) => {
    startTransition(async () => {
      await updateProductionStatus(productionSet.id, newStatus);
      setShowMenu(false);
      onUpdate?.();
    });
  };

  return (
    <Card className="relative">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {productionSet.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {productionSet.batesPrefix}{productionSet.batesStart.toString().padStart(6, '0')} -{' '}
              {productionSet.batesPrefix}{(productionSet.batesStart + productionSet.documentCount - 1).toString().padStart(6, '0')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="inline-flex items-center gap-1">
              {status.icon}
              {status.label}
            </Badge>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Play className="h-4 w-4" />
                    Start Processing
                  </button>
                  <button
                    onClick={handleRunQC}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Run QC
                  </button>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {productionSet.status !== 'draft' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-500 dark:text-slate-400">Processing Progress</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {productionSet.documentCount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Documents</p>
          </div>
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {productionSet.pageCount?.toLocaleString() || '-'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pages</p>
          </div>
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatFileSize(productionSet.totalSize || 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Size</p>
          </div>
        </div>

        {/* QC Issues */}
        {productionSet.qcIssues && productionSet.qcIssues.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
              QC Issues ({productionSet.qcIssues.length})
            </p>
            <ul className="space-y-1">
              {productionSet.qcIssues.slice(0, 3).map((issue, idx) => (
                <li key={idx} className="text-xs text-amber-600 dark:text-amber-400">
                  {issue}
                </li>
              ))}
              {productionSet.qcIssues.length > 3 && (
                <li className="text-xs text-amber-500">
                  +{productionSet.qcIssues.length - 3} more issues
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            icon={<Eye className="h-4 w-4" />}
          >
            View Documents
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={productionSet.status === 'draft' || isPending}
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            {isPending ? 'Processing...' : 'Export'}
          </Button>
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <p>Created: {new Date(productionSet.createdAt).toLocaleDateString()}</p>
          {productionSet.producedAt && (
            <p>Produced: {new Date(productionSet.producedAt).toLocaleDateString()}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

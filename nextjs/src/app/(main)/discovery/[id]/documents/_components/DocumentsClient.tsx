'use client';

/**
 * Documents Client Component
 * Client wrapper that coordinates DocumentTable and BulkActions
 * Manages selection state and wires bulk action handlers to server actions
 *
 * @module discovery/[id]/documents/_components/DocumentsClient
 */

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BulkActions } from './BulkActions';
import { DocumentTable } from './DocumentTable';
import type { ReviewDocument } from '../../../_types';
import {
  bulkUpdateDocuments,
  updateReviewStatus,
} from '../../../_actions';

interface DocumentsClientProps {
  discoveryRequestId: string;
  documents: ReviewDocument[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export function DocumentsClient({
  discoveryRequestId,
  documents,
  totalCount,
  currentPage,
  totalPages,
}: DocumentsClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const handleBulkAction = useCallback(
    async (action: string, value?: string) => {
      setActionError(null);
      const documentIds = Array.from(selectedIds);

      if (documentIds.length === 0 && action !== 'clear_selection') {
        return;
      }

      startTransition(async () => {
        try {
          switch (action) {
            case 'mark_reviewed': {
              // Use bulkUpdateDocuments for review status changes
              // Since bulkUpdateDocuments doesn't have mark_reviewed, we iterate
              const results = await Promise.all(
                documentIds.map((id) => updateReviewStatus(id, 'reviewed'))
              );
              const failed = results.filter((r) => !r.success).length;
              if (failed > 0) {
                setActionError(`${failed} document(s) failed to update`);
              }
              break;
            }

            case 'flag': {
              const results = await Promise.all(
                documentIds.map((id) => updateReviewStatus(id, 'flagged'))
              );
              const failed = results.filter((r) => !r.success).length;
              if (failed > 0) {
                setActionError(`${failed} document(s) failed to flag`);
              }
              break;
            }

            case 'code_responsive': {
              if (!value) return;
              const result = await bulkUpdateDocuments({
                documentIds,
                action: 'code_responsive',
                value,
              });
              if (!result.success) {
                setActionError(result.error || 'Failed to update responsive coding');
              }
              break;
            }

            case 'code_privileged': {
              if (!value) return;
              const result = await bulkUpdateDocuments({
                documentIds,
                action: 'code_privileged',
                value,
              });
              if (!result.success) {
                setActionError(result.error || 'Failed to update privileged coding');
              }
              break;
            }

            case 'add_tag': {
              if (!value) return;
              const result = await bulkUpdateDocuments({
                documentIds,
                action: 'add_tag',
                value,
              });
              if (!result.success) {
                setActionError(result.error || 'Failed to add tag');
              }
              break;
            }

            case 'assign_reviewer': {
              // Would need a modal to select reviewer - skip for now
              console.log('Assign reviewer not implemented');
              break;
            }

            case 'export': {
              // Would trigger export flow - skip for now
              console.log('Export not implemented');
              break;
            }

            case 'clear_selection': {
              setSelectedIds(new Set());
              return; // Skip router refresh
            }

            default:
              console.warn(`Unknown bulk action: ${action}`);
              return;
          }

          // Clear selection after successful action (except clear_selection)
          if (action !== 'clear_selection') {
            setSelectedIds(new Set());
          }

          // Refresh to show updated data
          router.refresh();
        } catch (error) {
          console.error('Bulk action failed:', error);
          setActionError(
            error instanceof Error ? error.message : 'An error occurred'
          );
        }
      });
    },
    [selectedIds, router]
  );

  return (
    <div className="space-y-4">
      {/* Error display */}
      {actionError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActions
        discoveryRequestId={discoveryRequestId}
        selectedCount={selectedIds.size}
        onAction={handleBulkAction}
        isLoading={isPending}
      />

      {/* Document Table */}
      <DocumentTable
        documents={documents}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}

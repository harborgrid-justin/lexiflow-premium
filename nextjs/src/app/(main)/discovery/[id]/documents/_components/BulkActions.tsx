'use client';

/**
 * Bulk Actions Component
 * Actions to apply to multiple selected documents
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  CheckCircle,
  AlertTriangle,
  Tag,
  Shield,
  Download,
  Trash2,
  Users,
} from 'lucide-react';

interface BulkActionsProps {
  discoveryRequestId: string;
  selectedCount?: number;
  onAction?: (action: string, value?: string) => void;
  isLoading?: boolean;
}

export function BulkActions({
  discoveryRequestId,
  selectedCount = 0,
  onAction,
  isLoading = false,
}: BulkActionsProps) {
  const [showTagModal, setShowTagModal] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mark Reviewed */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('mark_reviewed')}
            icon={<CheckCircle className="h-4 w-4" />}
            disabled={isLoading}
          >
            Mark Reviewed
          </Button>

          {/* Flag */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('flag')}
            icon={<AlertTriangle className="h-4 w-4" />}
            disabled={isLoading}
          >
            Flag
          </Button>

          {/* Code Responsive */}
          <div className="relative group">
            <Button
              size="sm"
              variant="outline"
              icon={<CheckCircle className="h-4 w-4" />}
              disabled={isLoading}
            >
              Responsive
            </Button>
            {!isLoading && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-10">
                <button
                  onClick={() => onAction?.('code_responsive', 'yes')}
                  className="w-full px-3 py-2 text-sm text-left text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Yes
                </button>
                <button
                  onClick={() => onAction?.('code_responsive', 'no')}
                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  No
                </button>
                <button
                  onClick={() => onAction?.('code_responsive', 'maybe')}
                  className="w-full px-3 py-2 text-sm text-left text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  Maybe
                </button>
              </div>
            )}
          </div>

          {/* Code Privileged */}
          <div className="relative group">
            <Button
              size="sm"
              variant="outline"
              icon={<Shield className="h-4 w-4" />}
              disabled={isLoading}
            >
              Privileged
            </Button>
            {!isLoading && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-10">
                <button
                  onClick={() => onAction?.('code_privileged', 'yes')}
                  className="w-full px-3 py-2 text-sm text-left text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Yes
                </button>
                <button
                  onClick={() => onAction?.('code_privileged', 'no')}
                  className="w-full px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  No
                </button>
              </div>
            )}
          </div>

          {/* Add Tag */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTagModal(true)}
            icon={<Tag className="h-4 w-4" />}
            disabled={isLoading}
          >
            Add Tag
          </Button>

          {/* Assign Reviewer */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('assign_reviewer')}
            icon={<Users className="h-4 w-4" />}
            disabled={isLoading}
          >
            Assign
          </Button>

          {/* Export */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('export')}
            icon={<Download className="h-4 w-4" />}
            disabled={isLoading}
          >
            Export
          </Button>

          {/* Clear Selection */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAction?.('clear_selection')}
            disabled={isLoading}
          >
            Clear
          </Button>

          {/* Loading indicator */}
          {isLoading && (
            <span className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
              Processing...
            </span>
          )}
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <TagModal
          onClose={() => setShowTagModal(false)}
          onApply={(tag) => {
            onAction?.('add_tag', tag);
            setShowTagModal(false);
          }}
        />
      )}
    </div>
  );
}

interface TagModalProps {
  onClose: () => void;
  onApply: (tag: string) => void;
}

function TagModal({ onClose, onApply }: TagModalProps) {
  const [tag, setTag] = useState('');

  const commonTags = [
    'Hot Document',
    'Key Evidence',
    'Needs Follow-up',
    'Redact',
    'Confidential',
    'Responsive',
    'For Production',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Add Tag
          </h3>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Enter tag name..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />

          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Common tags:
            </p>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => tag && onApply(tag)} disabled={!tag.trim()}>
              Apply Tag
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

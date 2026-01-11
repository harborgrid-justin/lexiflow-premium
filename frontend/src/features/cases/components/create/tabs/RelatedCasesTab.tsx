/**
 * Related cases tab component
 */

import React from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Link2, X } from 'lucide-react';
import { RelatedCase } from '../hooks/useRelatedCases';

export interface RelatedCasesTabProps {
  relatedCases: RelatedCase[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string) => void;
}

export const RelatedCasesTab: React.FC<RelatedCasesTabProps> = ({
  relatedCases,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Related Cases
        </h2>
        <Button
          variant="secondary"
          onClick={onAdd}
          icon={Link2}
        >
          Add Related Case
        </Button>
      </div>

      {relatedCases.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No related cases. Click "Add Related Case" to link a case.
        </div>
      ) : (
        <div className="space-y-4">
          {relatedCases.map((rc, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-1 grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={rc.court}
                  onChange={(e) => onUpdate(index, 'court', e.target.value)}
                  placeholder="Court"
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={rc.caseNumber}
                  onChange={(e) => onUpdate(index, 'caseNumber', e.target.value)}
                  placeholder="Case Number"
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={rc.relationship || ''}
                  onChange={(e) => onUpdate(index, 'relationship', e.target.value)}
                  placeholder="Relationship (optional)"
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                aria-label="Remove related case"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

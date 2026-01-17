/**
 * @module components/enterprise/CRM/BusinessDevelopment/RFPCard
 * @description Individual RFP card component
 */

import { cn } from '@/lib/cn';

import { formatCurrency, getStatusColor } from './utils';

import type { RFP } from './types';
import type { ThemeObject } from '@/lib/theme/types';

interface RFPCardProps {
  rfp: RFP;
  theme: ThemeObject;
}

export function RFPCard({ rfp, theme }: RFPCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className={cn('font-bold text-lg', theme.text.primary)}>{rfp.title}</h4>
            <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusColor(rfp.status))}>
              {rfp.status}
            </span>
            {rfp.goNoGoDecision === 'Go' && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Go Decision
              </span>
            )}
          </div>
          <p className={cn('text-sm', theme.text.secondary)}>
            {rfp.clientName} • {rfp.practiceArea} • {rfp.industry}
          </p>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold', theme.text.primary)}>
            {formatCurrency(rfp.estimatedValue)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={cn('text-sm', theme.text.secondary)}>Completion Progress</span>
          <span className={cn('text-sm font-medium', theme.text.primary)}>{rfp.progress}%</span>
        </div>
        <div className={cn('w-full h-2 rounded-full', theme.surface.highlight)}>
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${rfp.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Received</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{rfp.receivedDate}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Due Date</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{rfp.dueDate}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Team Lead</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{rfp.teamLead}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Contributors</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{rfp.contributors.length} people</p>
        </div>
      </div>

      {rfp.sections.length > 0 && (
        <div className={cn('p-4 rounded', theme.surface.highlight)}>
          <p className={cn('text-xs font-medium mb-3', theme.text.tertiary)}>Section Status</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {rfp.sections.map((section, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className={cn('text-sm', theme.text.secondary)}>{section.name}</span>
                <span className={cn('px-2 py-0.5 rounded text-xs', getStatusColor(section.status))}>
                  {section.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rfp.goNoGoReason && (
        <div className={cn('mt-4 p-3 rounded border-l-4 border-l-green-600', theme.surface.default, 'border')}>
          <p className={cn('text-sm', theme.text.primary)}>
            <strong>Go/No-Go Rationale:</strong> {rfp.goNoGoReason}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * @module components/enterprise/CRM/BusinessDevelopment/LeadCard
 * @description Individual lead card component
 */

import { cn } from '@/utils/cn';
import { Clock } from 'lucide-react';
import type { Lead } from './types';
import { formatCurrency, getStatusColor } from './utils';

interface LeadCardProps {
  lead: Lead;
  onClick: (id: string) => void;
  theme: any;
}

export function LeadCard({ lead, onClick, theme }: LeadCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer',
        theme.surface.default,
        theme.border.default
      )}
      onClick={() => onClick(lead.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn('font-bold text-lg', theme.text.primary)}>
              {lead.name} - {lead.company}
            </h3>
            <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusColor(lead.status))}>
              {lead.status}
            </span>
          </div>
          <p className={cn('text-sm', theme.text.secondary)}>
            {lead.practiceArea} • {lead.industry}
          </p>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold', theme.text.primary)}>
            {formatCurrency(lead.estimatedValue)}
          </p>
          <p className={cn('text-xs', theme.text.tertiary)}>{lead.probability}% probability</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Source</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{lead.source}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Assigned To</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{lead.assignedTo}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Created</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{lead.createdDate}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Last Activity</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{lead.lastActivity}</p>
        </div>
      </div>

      {lead.nextAction && (
        <div className={cn('p-3 rounded', theme.surface.highlight)}>
          <div className="flex items-center gap-2">
            <Clock className={cn('h-4 w-4', theme.text.secondary)} />
            <p className={cn('text-sm font-medium', theme.text.primary)}>
              Next: {lead.nextAction}
              {lead.nextActionDate && ` (${lead.nextActionDate})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

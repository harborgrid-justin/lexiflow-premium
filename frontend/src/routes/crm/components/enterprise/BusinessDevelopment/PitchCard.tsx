/**
 * @module components/enterprise/CRM/BusinessDevelopment/PitchCard
 * @description Individual pitch card component
 */

import { Calendar } from 'lucide-react';

import { cn } from '@/lib/cn';

import { formatCurrency, getStatusColor } from './utils';

import type { Pitch } from './types';
import type { ThemeObject } from '@/lib/theme/types';

interface PitchCardProps {
  pitch: Pitch;
  theme: ThemeObject;
}

export function PitchCard({ pitch, theme }: PitchCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className={cn('font-bold', theme.text.primary)}>{pitch.clientName}</h4>
            <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusColor(pitch.status))}>
              {pitch.status}
            </span>
          </div>
          <p className={cn('text-sm', theme.text.secondary)}>
            {pitch.practiceArea} • {pitch.pitchType} Pitch
          </p>
        </div>
        <p className={cn('text-xl font-bold', theme.text.primary)}>
          {formatCurrency(pitch.estimatedValue)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Pitch Date</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{pitch.pitchDate}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Presenters</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{pitch.presenters.join(', ')}</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Attendees</p>
          <p className={cn('text-sm font-medium', theme.text.primary)}>{pitch.attendees.length} people</p>
        </div>
      </div>

      {pitch.outcome && (
        <div className={cn('p-3 rounded mb-4', theme.surface.highlight)}>
          <p className={cn('text-sm', theme.text.primary)}>
            <strong>Outcome:</strong> {pitch.outcome}
            {pitch.feedbackReceived && ' • Feedback received'}
          </p>
        </div>
      )}

      {pitch.notes && (
        <p className={cn('text-sm mb-4', theme.text.secondary)}>{pitch.notes}</p>
      )}

      {pitch.followUpDate && (
        <div className="flex items-center gap-2">
          <Calendar className={cn('h-4 w-4', theme.text.tertiary)} />
          <p className={cn('text-sm', theme.text.secondary)}>
            Follow-up scheduled: {pitch.followUpDate}
          </p>
        </div>
      )}
    </div>
  );
}

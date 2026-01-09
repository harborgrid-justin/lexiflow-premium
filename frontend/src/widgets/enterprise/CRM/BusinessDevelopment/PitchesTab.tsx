/**
 * @module components/enterprise/CRM/BusinessDevelopment/PitchesTab
 * @description Pitches tab view component
 */

import type { ThemeObject } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Plus } from 'lucide-react';
import { PitchCard } from './PitchCard';
import type { Pitch } from './types';

interface PitchesTabProps {
  pitches: Pitch[];
  theme: ThemeObject;
}

export function PitchesTab({ pitches, theme }: PitchesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn('font-medium', theme.text.primary)}>Pitch Activities</h3>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Schedule Pitch
        </button>
      </div>

      <div className="space-y-3">
        {pitches.map(pitch => (
          <PitchCard key={pitch.id} pitch={pitch} theme={theme} />
        ))}
      </div>
    </div>
  );
}

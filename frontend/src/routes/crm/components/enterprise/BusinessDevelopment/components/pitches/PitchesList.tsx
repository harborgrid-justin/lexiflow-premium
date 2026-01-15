/**
 * PitchesList Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/pitches
 * @description List of pitch activities with header
 */

import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Plus } from 'lucide-react';
import { Pitch } from '../../types';
import { PitchCard } from './PitchCard';
import React from "react";

interface PitchesListProps {
  pitches: Pitch[];
  onSchedulePitch?: () => void;
}

export const PitchesList: React.FC<PitchesListProps> = ({ pitches, onSchedulePitch }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>Pitch Activities</h3>
        <button
          onClick={onSchedulePitch}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Schedule Pitch
        </button>
      </div>

      <div className="space-y-3">
        {pitches.map(pitch => (
          <PitchCard key={pitch.id} pitch={pitch} />
        ))}
      </div>
    </div>
  );
};

/**
 * @module components/enterprise/CRM/BusinessDevelopment/RFPsTab
 * @description RFPs tab view component
 */

import type { ThemeObject } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Plus } from 'lucide-react';
import { RFPCard } from './RFPCard';
import type { RFP } from './types';

interface RFPsTabProps {
  rfps: RFP[];
  theme: ThemeObject;
}

export function RFPsTab({ rfps, theme }: RFPsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn('font-medium', theme.text.primary)}>RFP Tracker</h3>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Add RFP
        </button>
      </div>

      <div className="space-y-4">
        {rfps.map(rfp => (
          <RFPCard key={rfp.id} rfp={rfp} theme={theme} />
        ))}
      </div>
    </div>
  );
}

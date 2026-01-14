/**
 * RFPsList Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/rfps
 * @description RFP tracker list with header
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { Plus } from 'lucide-react';
import { RFP } from '../../types';
import { RFPCard } from './RFPCard';
import React from "react";

interface RFPsListProps {
  rfps: RFP[];
  onAddRFP?: () => void;
}

export const RFPsList: React.FC<RFPsListProps> = ({ rfps, onAddRFP }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>RFP Tracker</h3>
        <button
          onClick={onAddRFP}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Add RFP
        </button>
      </div>

      <div className="space-y-4">
        {rfps.map(rfp => (
          <RFPCard key={rfp.id} rfp={rfp} />
        ))}
      </div>
    </div>
  );
};

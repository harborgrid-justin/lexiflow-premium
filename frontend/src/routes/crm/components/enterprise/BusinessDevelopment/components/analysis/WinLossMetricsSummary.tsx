/**
 * WinLossMetricsSummary Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/analysis
 * @description Key metrics summary card for win/loss analysis
 */

import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { WinLossAnalysis } from '../../types';
import React from "react";

interface WinLossMetricsSummaryProps {
  winLossData: WinLossAnalysis[];
  pipelineValue: number;
  winRate: string;
}

export const WinLossMetricsSummary: React.FC<WinLossMetricsSummaryProps> = ({
  winLossData,
  pipelineValue,
  winRate
}) => {
  const { theme } = useTheme();

  const avgSalesCycle = winLossData.length > 0
    ? (winLossData.reduce((acc, w) => acc + w.salesCycle, 0) / winLossData.length).toFixed(0)
    : '0';

  return (
    <Card title="Key Metrics Summary">
      <div className="space-y-4">
        <div className={cn("p-4 rounded", theme.surface.highlight)}>
          <p className={cn("text-sm", theme.text.tertiary)}>Total Pipeline Value</p>
          <p className={cn("text-2xl font-bold", theme.text.primary)}>
            ${(pipelineValue / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className={cn("p-4 rounded", theme.surface.highlight)}>
          <p className={cn("text-sm", theme.text.tertiary)}>Win Rate</p>
          <p className={cn("text-2xl font-bold text-green-600")}>{winRate}%</p>
        </div>
        <div className={cn("p-4 rounded", theme.surface.highlight)}>
          <p className={cn("text-sm", theme.text.tertiary)}>Avg Sales Cycle</p>
          <p className={cn("text-2xl font-bold", theme.text.primary)}>
            {avgSalesCycle} days
          </p>
        </div>
      </div>
    </Card>
  );
};

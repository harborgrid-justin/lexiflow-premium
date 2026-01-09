/**
 * @module components/enterprise/CRM/BusinessDevelopment/WinLossCard
 * @description Individual win/loss analysis card component
 */

import type { ThemeObject } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { WinLossAnalysis } from './types';

interface WinLossCardProps {
  analysis: WinLossAnalysis;
  theme: ThemeObject;
}

export function WinLossCard({ analysis, theme }: WinLossCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border', theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {analysis.outcome === 'Won' ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
          <div>
            <h4 className={cn('font-bold', theme.text.primary)}>{analysis.opportunityName}</h4>
            <p className={cn('text-sm', theme.text.secondary)}>
              {analysis.clientName} • {analysis.practiceArea}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold', analysis.outcome === 'Won' ? 'text-green-600' : 'text-red-600')}>
            ${((analysis.actualValue || analysis.estimatedValue) / 1000).toFixed(0)}k
          </p>
          <p className={cn('text-xs', theme.text.tertiary)}>
            Sales Cycle: {analysis.salesCycle} days
          </p>
        </div>
      </div>

      {analysis.outcome === 'Won' && analysis.winReasons && (
        <div className="p-4 rounded mb-4 bg-green-50 dark:bg-green-900/20">
          <p className="text-xs font-medium mb-2 text-green-800 dark:text-green-400">Win Reasons</p>
          <ul className="space-y-1">
            {analysis.winReasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-green-700 dark:text-green-300">• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.outcome === 'Lost' && analysis.lossReasons && (
        <div className="p-4 rounded mb-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-xs font-medium mb-2 text-red-800 dark:text-red-400">Loss Reasons</p>
          <ul className="space-y-1">
            {analysis.lossReasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-red-700 dark:text-red-300">• {reason}</li>
            ))}
          </ul>
          {analysis.competitorWon && (
            <p className="text-sm mt-2 text-red-700 dark:text-red-300">
              <strong>Won by:</strong> {analysis.competitorWon}
            </p>
          )}
        </div>
      )}

      <div className={cn('p-4 rounded', theme.surface.highlight)}>
        <p className={cn('text-xs font-medium mb-2', theme.text.tertiary)}>Lessons Learned</p>
        <ul className="space-y-1">
          {analysis.lessonsLearned.map((lesson, idx) => (
            <li key={idx} className={cn('text-sm', theme.text.primary)}>• {lesson}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

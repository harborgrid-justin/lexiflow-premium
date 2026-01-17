/**
 * @file AnalyticsPanel.tsx
 * @description Workflow analytics with bottleneck detection and optimization suggestions
 */

import { AlertTriangle, TrendingUp } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card/Card';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { WorkflowAnalytics } from '@/types/workflow-advanced-types';

interface AnalyticsPanelProps {
  analytics: WorkflowAnalytics | undefined;
}

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const { theme } = useTheme();

  if (!analytics) {
    return null;
  }

  return (
    <Card title="Workflow Analytics & Bottleneck Detection">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className={cn("p-4 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.tertiary)}>Total Executions</p>
            <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
              {analytics?.summary?.totalExecutions || 0}
            </p>
          </div>
          <div className={cn("p-4 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.tertiary)}>Success Rate</p>
            <p className={cn("text-2xl font-bold mt-1 text-green-600")}>
              {(analytics?.summary?.successRate || 0).toFixed(1)}%
            </p>
          </div>
          <div className={cn("p-4 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.tertiary)}>Avg Duration</p>
            <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
              {((analytics?.summary?.averageDuration || 0) / 3600000).toFixed(1)}h
            </p>
          </div>
          <div className={cn("p-4 rounded-lg", theme.surface.highlight)}>
            <p className={cn("text-xs", theme.text.tertiary)}>SLA Compliance</p>
            <p className={cn("text-2xl font-bold mt-1 text-blue-600")}>
              {(analytics?.summary?.slaComplianceRate || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Bottlenecks */}
        <div>
          <h4 className={cn("font-semibold mb-3", theme.text.primary)}>
            Detected Bottlenecks
          </h4>
          <div className="space-y-2">
            {analytics?.bottlenecks?.map((bottleneck) => (
              <div
                key={bottleneck.id}
                className={cn("p-4 rounded-lg border-l-4", theme.surface.default, theme.border.default,
                  bottleneck.severity === 'critical' ? "border-l-red-500" :
                    bottleneck.severity === 'high' ? "border-l-amber-500" :
                      bottleneck.severity === 'medium' ? "border-l-blue-500" : "border-l-slate-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className={cn("font-medium", theme.text.primary)}>
                        {bottleneck.nodeName}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-medium",
                        bottleneck.severity === 'critical' ? "bg-red-100 text-red-700" :
                          bottleneck.severity === 'high' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {bottleneck.severity}
                      </span>
                    </div>
                    <p className={cn("text-sm mt-2", theme.text.secondary)}>
                      {bottleneck.description}
                    </p>
                    <p className={cn("text-xs mt-2 text-green-600")}>
                      {bottleneck.recommendation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs", theme.text.tertiary)}>Impact</p>
                    <p className={cn("text-sm font-bold", theme.text.primary)}>
                      +{(bottleneck.impact.averageDelay / 3600000).toFixed(1)}h delay
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Suggestions */}
        <div>
          <h4 className={cn("font-semibold mb-3", theme.text.primary)}>
            Optimization Suggestions
          </h4>
          <div className="space-y-2">
            {analytics?.optimizationSuggestions?.map((suggestion) => (
              <div
                key={suggestion.id}
                className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className={cn("font-medium", theme.text.primary)}>
                        {suggestion.title}
                      </span>
                    </div>
                    <p className={cn("text-sm mt-1", theme.text.secondary)}>
                      {suggestion.description}
                    </p>
                    {suggestion.estimatedImpact.durationReduction && (
                      <p className={cn("text-xs mt-2 text-green-600")}>
                        {(suggestion.estimatedImpact.durationReduction * 100).toFixed(0)}% faster
                      </p>
                    )}
                  </div>
                  {suggestion.autoApplicable && (
                    <Button variant="primary" size="sm">
                      Auto-Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

AnalyticsPanel.displayName = 'AnalyticsPanel';

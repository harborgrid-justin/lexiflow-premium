/**
 * @file SLAMonitoringPanel.tsx
 * @description SLA monitoring dashboard with escalation policies
 */

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { Card } from '@/components/molecules/Card/Card';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
export function SLAMonitoringPanel() {
  const { theme } = useTheme();

  return (
    <Card title="SLA Monitoring Dashboard">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <p className={cn("text-2xl font-bold", theme.text.primary)}>24h</p>
            <p className={cn("text-xs", theme.text.tertiary)}>Target Duration</p>
          </div>
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <p className={cn("text-2xl font-bold", theme.text.primary)}>80%</p>
            <p className={cn("text-xs", theme.text.tertiary)}>Warning Threshold</p>
          </div>
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <p className={cn("text-2xl font-bold", theme.text.primary)}>95%</p>
            <p className={cn("text-xs", theme.text.tertiary)}>Compliance Rate</p>
          </div>
        </div>

        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <h4 className={cn("font-semibold mb-3", theme.text.primary)}>
            Escalation Policy
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <div>
                <p className={cn("text-sm font-medium", theme.text.primary)}>Level 1: Email notification at 80%</p>
                <p className={cn("text-xs", theme.text.tertiary)}>Send to task owner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                2
              </div>
              <div>
                <p className={cn("text-sm font-medium", theme.text.primary)}>Level 2: Escalate to manager at 100%</p>
                <p className={cn("text-xs", theme.text.tertiary)}>Create high-priority task</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

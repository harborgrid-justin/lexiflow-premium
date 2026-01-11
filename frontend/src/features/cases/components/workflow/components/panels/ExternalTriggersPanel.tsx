/**
 * @file ExternalTriggersPanel.tsx
 * @description External system triggers and webhook configuration
 */

import { Button } from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Webhook } from 'lucide-react';
import React from 'react';
import type { ExternalTrigger } from '@/types/workflow-advanced-types';

interface ExternalTriggersPanelProps {
  externalTrigger: ExternalTrigger | null;
  onCreateWebhook: () => void;
}

export const ExternalTriggersPanel: React.FC<ExternalTriggersPanelProps> = ({
  externalTrigger,
  onCreateWebhook,
}) => {
  const { theme } = useTheme();

  return (
    <Card title="External System Triggers">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm", theme.text.secondary)}>
            Event-driven workflow automation via webhooks and API integrations
          </p>
          <Button icon={Webhook} onClick={onCreateWebhook}>
            Create Webhook
          </Button>
        </div>

        {externalTrigger && (
          <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex items-center gap-3 mb-3">
              <Webhook className="h-5 w-5 text-blue-500" />
              <span className={cn("font-semibold", theme.text.primary)}>
                {externalTrigger.name}
              </span>
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                externalTrigger.enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
              )}>
                {externalTrigger.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className={cn("p-3 rounded font-mono text-xs break-all", theme.surface.highlight)}>
              {externalTrigger.type === 'webhook' && externalTrigger.config.type === 'webhook'
                ? externalTrigger.config.url || 'Generating webhook URL...'
                : 'Generating webhook URL...'}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className={cn(theme.text.tertiary)}>Total Triggers</p>
                <p className={cn("font-bold", theme.text.primary)}>
                  {externalTrigger.metrics.totalTriggers}
                </p>
              </div>
              <div>
                <p className={cn(theme.text.tertiary)}>Success Rate</p>
                <p className="font-bold text-green-600">
                  {externalTrigger.metrics.totalTriggers > 0
                    ? ((externalTrigger.metrics.successfulTriggers / externalTrigger.metrics.totalTriggers) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div>
                <p className={cn(theme.text.tertiary)}>Avg Processing</p>
                <p className={cn("font-bold", theme.text.primary)}>
                  {externalTrigger.metrics.averageProcessingTime}ms
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={cn("p-4 rounded-lg border-2 border-dashed text-center", theme.border.default)}>
          <Webhook className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className={cn("font-medium", theme.text.primary)}>
            Configure External Triggers
          </p>
          <p className={cn("text-sm mt-1", theme.text.secondary)}>
            Webhooks, API polling, email monitoring, file watching, and more
          </p>
        </div>
      </div>
    </Card>
  );
};

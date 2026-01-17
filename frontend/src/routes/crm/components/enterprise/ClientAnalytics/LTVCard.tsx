/**
 * @module components/enterprise/CRM/ClientAnalytics/LTVCard
 * @description Client lifetime value card component
 */

import { cn } from '@/lib/cn';

import type { ClientLifetimeValue } from './types';
import type { ThemeObject } from '@/lib/theme/types';

interface LTVCardProps {
  client: ClientLifetimeValue;
  theme: ThemeObject;
}

export function LTVCard({ client, theme }: LTVCardProps) {
  const roi = ((client.ltv / client.acquisitionCost - 1) * 100).toFixed(0);
  const historicalValue = client.ltv - client.projectedFutureValue;
  const historicalPercent = (historicalValue / client.ltv * 100).toFixed(0);
  const projectedPercent = (client.projectedFutureValue / client.ltv * 100).toFixed(0);

  return (
    <div className={cn('p-6 rounded-lg border', theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={cn('font-bold text-lg', theme.text.primary)}>{client.clientName}</h4>
          <p className={cn('text-sm', theme.text.secondary)}>
            Client for {client.yearsAsClient.toFixed(1)} years
          </p>
        </div>
        <div className="text-right">
          <p className={cn('text-xs', theme.text.tertiary)}>Total LTV</p>
          <p className="text-2xl font-bold text-green-600">
            ${(client.ltv / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Acquisition Cost</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            ${(client.acquisitionCost / 1000).toFixed(1)}k
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Avg Annual Revenue</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            ${(client.avgAnnualRevenue / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Retention Rate</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>{client.retentionRate}%</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>ROI</p>
          <p className="text-sm font-bold text-green-600">{roi}%</p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Projected Future Value</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            ${(client.projectedFutureValue / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className={cn('mt-4 pt-4 border-t', theme.border.default)}>
        <p className={cn('text-xs mb-2', theme.text.tertiary)}>LTV Composition</p>
        <div className="flex gap-2">
          <div
            className="h-2 rounded bg-green-600"
            style={{ width: `${historicalPercent}%` }}
            title="Historical Value"
          />
          <div
            className="h-2 rounded bg-blue-600"
            style={{ width: `${projectedPercent}%` }}
            title="Projected Value"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className={cn('text-xs', theme.text.tertiary)}>
            Historical: ${(historicalValue / 1000).toFixed(0)}k
          </span>
          <span className={cn('text-xs', theme.text.tertiary)}>
            Projected: ${(client.projectedFutureValue / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </div>
  );
}

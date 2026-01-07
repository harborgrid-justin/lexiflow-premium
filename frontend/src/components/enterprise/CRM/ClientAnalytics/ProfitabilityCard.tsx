/**
 * @module components/enterprise/CRM/ClientAnalytics/ProfitabilityCard
 * @description Individual client profitability card
 */

import { cn } from '@/utils/cn';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ClientProfitability } from './types';
import { formatCurrency, formatPercentage } from './utils';

interface ProfitabilityCardProps {
  client: ClientProfitability;
  theme: any;
}

export function ProfitabilityCard({ client, theme }: ProfitabilityCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border', theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {client.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
          {client.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
          {client.trend === 'stable' && <div className="h-5 w-5" />}
          <div>
            <h4 className={cn('font-bold', theme.text.primary)}>{client.clientName}</h4>
            <p className={cn('text-sm', theme.text.secondary)}>
              Profit Margin: {formatPercentage(client.profitMargin)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-xl font-bold text-green-600')}>
            {formatCurrency(client.profit)}
          </p>
          <p className={cn('text-xs', theme.text.tertiary)}>Profit</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Revenue</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            {formatCurrency(client.totalRevenue)}
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Costs</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            {formatCurrency(client.totalCosts)}
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Realization</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            {formatPercentage(client.realization)}
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Collection</p>
          <p className={cn('text-sm font-bold', theme.text.primary)}>
            {formatPercentage(client.collectionRate)}
          </p>
        </div>
      </div>
    </div>
  );
}

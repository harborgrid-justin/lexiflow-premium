/**
 * @module components/enterprise/CRM/ClientAnalytics/RiskCard
 * @description Client risk assessment card component
 */

import { cn } from '@/utils/cn';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ClientRiskAssessment } from './types';
import {
  formatCurrency,
  formatFactorName,
  getDaysOutstandingColor,
  getRiskBarColor,
  getRiskColor
} from './utils';

interface RiskCardProps {
  client: ClientRiskAssessment;
  theme: any;
}

export function RiskCard({ client, theme }: RiskCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border', theme.border.default)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {client.overallRisk === 'Critical' && <AlertTriangle className="h-6 w-6 text-red-600" />}
          {client.overallRisk === 'High' && <AlertTriangle className="h-6 w-6 text-orange-600" />}
          {client.overallRisk === 'Medium' && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
          {client.overallRisk === 'Low' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
          <div>
            <h4 className={cn('font-bold', theme.text.primary)}>{client.clientName}</h4>
            <p className={cn('text-sm', theme.text.secondary)}>
              Last activity: {client.lastActivity}
            </p>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getRiskColor(client.overallRisk))}>
          {client.overallRisk} Risk ({client.riskScore}/100)
        </span>
      </div>

      {/* Risk Factors */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {Object.entries(client.factors).map(([factor, score]) => (
          <div key={factor}>
            <p className={cn('text-xs mb-1', theme.text.tertiary)}>
              {formatFactorName(factor)}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700">
                <div
                  className={cn('h-full rounded transition-all', getRiskBarColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={cn('text-xs font-medium', theme.text.primary)}>{score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Risk Indicators */}
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t', theme.border.default)}>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Outstanding Balance</p>
          <p className={cn('text-lg font-bold', theme.text.primary)}>
            {formatCurrency(client.outstandingBalance)}
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Days Outstanding</p>
          <p className={cn(
            'text-lg font-bold',
            getDaysOutstandingColor(client.daysOutstanding) || theme.text.primary
          )}>
            {client.daysOutstanding} days
          </p>
        </div>
        <div>
          <p className={cn('text-xs', theme.text.tertiary)}>Disputed Invoices</p>
          <p className={cn(
            'text-lg font-bold',
            client.disputedInvoices > 0 ? 'text-red-600' : theme.text.primary
          )}>
            {client.disputedInvoices}
          </p>
        </div>
      </div>
    </div>
  );
}

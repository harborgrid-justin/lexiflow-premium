/**
 * BusinessDevelopmentMetrics Component
 * @module components/enterprise/CRM/BusinessDevelopment/components/metrics
 * @description Calculates and returns business development metrics
 */

import { Lead } from '../../types';

export interface BusinessDevelopmentMetrics {
  pipelineValue: number;
  winRate: number;
  avgSalesCycle: number;
  activeLeads: number;
  wonValue: number;
}

export const useBusinessDevelopmentMetrics = (
  leads: Lead[]
): BusinessDevelopmentMetrics => {
  const activeLeads = leads.filter(
    l => !['Won', 'Lost'].includes(l.status)
  ).length;

  const pipelineValue = leads
    .filter(l => !['Won', 'Lost'].includes(l.status))
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const wonValue = leads
    .filter(l => l.status === 'Won')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const wonCount = leads.filter(l => l.status === 'Won').length;
  const closedCount = leads.filter(l => ['Won', 'Lost'].includes(l.status)).length;
  const winRate = ((wonCount / Math.max(closedCount, 1)) * 100).toFixed(1);

  return {
    activeLeads,
    pipelineValue,
    wonValue,
    winRate: parseFloat(winRate)
  };
};

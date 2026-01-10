/**
 * @module components/enterprise/CRM/ClientAnalytics/ClientAnalyticsView
 * @description Main view component (~90 LOC target) - Pure JSX presentation layer
 */

import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, Award, DollarSign, Star, TrendingUp } from 'lucide-react';
import { LTVTab } from './LTVTab';
import { ProfitabilityTab } from './ProfitabilityTab';
import { RiskTab } from './RiskTab';
import { SatisfactionTab } from './SatisfactionTab';
import { TABS } from './constants';
import { useClientAnalytics } from './useClientAnalytics';
import { formatCurrency, formatCurrencyMillions } from './utils';

export function ClientAnalyticsView() {
  const {
    activeTab,
    setActiveTab,
    profitabilityData,
    ltvData,
    riskData,
    satisfactionData,
    segmentData,
    revenueTrendData,
    metrics,
    theme,
    chartColors,
    chartTheme
  } = useClientAnalytics();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Client Profit"
          value={`${formatCurrency(metrics.totalProfit)}`}
          icon={DollarSign}
          trend="+15% YTD"
          trendUp={true}
          className="border-l-4 border-l-green-600"
        />
        <MetricCard
          label="Avg Profit Margin"
          value={`${metrics.avgProfitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Total LTV"
          value={formatCurrencyMillions(metrics.totalLTV)}
          icon={Award}
          trend="+22% vs Last Year"
          trendUp={true}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard
          label="Avg NPS Score"
          value={metrics.avgNPS.toFixed(0)}
          icon={Star}
          trend="Promoter Category"
          trendUp={true}
          className="border-l-4 border-l-amber-500"
        />
      </div>

      {/* Risk Alert */}
      {metrics.highRiskClients > 0 && (
        <div className={cn('p-4 rounded-lg border-l-4 border-l-red-600', theme.surface.default, 'border')}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className={cn('font-medium', theme.text.primary)}>
                {metrics.highRiskClients} High-Risk Client{metrics.highRiskClients > 1 ? 's' : ''} Require Attention
              </p>
              <p className={cn('text-sm', theme.text.secondary)}>
                Review risk assessment tab for details and recommended actions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={cn('border-b', theme.border.default)}>
        <div className="flex gap-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : cn('border-transparent', theme.text.secondary, 'hover:text-blue-600')
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profitability' && (
          <ProfitabilityTab
            profitabilityData={profitabilityData}
            segmentData={segmentData}
            revenueTrendData={revenueTrendData}
            theme={theme}
            chartTheme={chartTheme as any}
            chartColors={chartColors}
          />
        )}
        {activeTab === 'ltv' && <LTVTab ltvData={ltvData} theme={theme} />}
        {activeTab === 'risk' && <RiskTab riskData={riskData} theme={theme} />}
        {activeTab === 'satisfaction' && (
          <SatisfactionTab
            satisfactionData={satisfactionData}
            theme={theme}
            chartColors={chartColors}
            chartTheme={chartTheme as any}
          />
        )}
      </div>
    </div>
  );
}

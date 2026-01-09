/**
 * @module components/enterprise/CRM/BusinessDevelopment/BusinessDevelopmentView
 * @description Main view component (90 LOC target) - Pure JSX presentation layer
 */

import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';
import { cn } from '@/shared/lib/cn';
import { Award, DollarSign, Target, Users } from 'lucide-react';
import { AnalysisTab } from './AnalysisTab';
import { TABS } from './constants';
import { LeadsTab } from './LeadsTab';
import { PitchesTab } from './PitchesTab';
import { RFPsTab } from './RFPsTab';
import { useBusinessDevelopment } from './useBusinessDevelopment';
import { formatCurrencyMillions } from './utils';

export function BusinessDevelopmentView() {
  const {
    activeTab,
    setActiveTab,
    leads,
    pitches,
    rfps,
    winLossData,
    analyticsData,
    metrics,
    theme,
    chartColors,
    chartTheme,
    setSelectedLead
  } = useBusinessDevelopment();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Leads"
          value={metrics.activeLeads.toString()}
          icon={Users}
          trend="+8 this week"
          trendUp={true}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Pipeline Value"
          value={formatCurrencyMillions(metrics.pipelineValue)}
          icon={DollarSign}
          trend="+12% this month"
          trendUp={true}
          className="border-l-4 border-l-green-600"
        />
        <MetricCard
          label="Win Rate"
          value={`${metrics.winRate}%`}
          icon={Target}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard
          label="Won (YTD)"
          value={formatCurrencyMillions(metrics.wonValue)}
          icon={Award}
          trend="+25% vs Last Year"
          trendUp={true}
          className="border-l-4 border-l-amber-500"
        />
      </div>

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
        {activeTab === 'leads' && (
          <LeadsTab
            leads={leads}
            leadsByStatus={analyticsData.leadsByStatus}
            onLeadClick={setSelectedLead}
            theme={theme}
            chartTheme={chartTheme}
            chartColors={chartColors}
          />
        )}
        {activeTab === 'pitches' && <PitchesTab pitches={pitches} theme={theme} />}
        {activeTab === 'rfps' && <RFPsTab rfps={rfps} theme={theme} />}
        {activeTab === 'analysis' && (
          <AnalysisTab
            winLossData={winLossData}
            conversionTrend={analyticsData.conversionTrend}
            leadsBySource={analyticsData.leadsBySource}
            pipelineValue={metrics.pipelineValue}
            winRate={metrics.winRate}
            avgSalesCycle={metrics.avgSalesCycle}
            theme={theme}
            chartTheme={chartTheme}
            chartColors={chartColors}
          />
        )}
      </div>
    </div>
  );
}

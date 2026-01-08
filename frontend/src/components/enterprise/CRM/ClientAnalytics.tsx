/**
 * @module components/enterprise/CRM/ClientAnalytics
 * @category Enterprise CRM
 * @description Advanced client analytics including profitability analysis,
 * lifetime value calculation, risk assessment, and satisfaction tracking.
 */

import { Card } from '@/components/ui/molecules/Card/Card';
import { MetricCard } from '@/components/ui/molecules/MetricCard/MetricCard';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/backend';
import { DataService } from '@/services/data/dataService';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { ChartColorService } from '@/services/theme/chartColorService';
import { getChartTheme } from '@/utils/chartConfig';
import { cn } from '@/utils/cn';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  DollarSign,
  Star,
  ThumbsUp,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface ClientProfitability {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number; // percentage
  realization: number; // percentage
  collectionRate: number; // percentage
  trend: 'up' | 'down' | 'stable';
}

interface ClientLifetimeValue {
  clientId: string;
  clientName: string;
  ltv: number;
  acquisitionCost: number;
  retentionRate: number;
  avgAnnualRevenue: number;
  yearsAsClient: number;
  projectedFutureValue: number;
}

interface ClientRiskAssessment {
  clientId: string;
  clientName: string;
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number; // 0-100
  factors: {
    paymentRisk: number;
    scopeCreepRisk: number;
    communicationRisk: number;
    expectationRisk: number;
    complianceRisk: number;
  };
  outstandingBalance: number;
  daysOutstanding: number;
  disputedInvoices: number;
  lastActivity: string;
}

interface ClientSatisfaction {
  clientId: string;
  clientName: string;
  nps: number; // Net Promoter Score -100 to 100
  csat: number; // Customer Satisfaction 0-100
  responsiveness: number; // 0-10
  quality: number; // 0-10
  value: number; // 0-10
  likelihood: number; // 0-10 (likelihood to recommend)
  lastSurveyDate: string;
  totalSurveys: number;
}

interface ClientSegment {
  segment: string;
  count: number;
  revenue: number;
  avgLifetimeValue: number;
  color: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ClientAnalytics: React.FC = () => {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as 'light' | 'dark');
  const chartTheme = getChartTheme(mode as 'light' | 'dark');
  const [activeTab, setActiveTab] = useState<'profitability' | 'ltv' | 'risk' | 'satisfaction'>('profitability');

  // Data queries
  useQuery(QUERY_KEYS.CLIENTS.ALL, () => DataService.clients.getAll());

  // Mock analytics data
  const profitabilityData: ClientProfitability[] = [
    {
      clientId: '1',
      clientName: 'Acme Corporation',
      totalRevenue: 450000,
      totalCosts: 270000,
      profit: 180000,
      profitMargin: 40,
      realization: 92,
      collectionRate: 95,
      trend: 'up'
    },
    {
      clientId: '2',
      clientName: 'Tech Startup Inc.',
      totalRevenue: 320000,
      totalCosts: 224000,
      profit: 96000,
      profitMargin: 30,
      realization: 85,
      collectionRate: 88,
      trend: 'stable'
    },
    {
      clientId: '3',
      clientName: 'Global Industries LLC',
      totalRevenue: 280000,
      totalCosts: 238000,
      profit: 42000,
      profitMargin: 15,
      realization: 78,
      collectionRate: 72,
      trend: 'down'
    }
  ];

  const ltvData: ClientLifetimeValue[] = [
    {
      clientId: '1',
      clientName: 'Acme Corporation',
      ltv: 1250000,
      acquisitionCost: 15000,
      retentionRate: 95,
      avgAnnualRevenue: 180000,
      yearsAsClient: 5.2,
      projectedFutureValue: 850000
    },
    {
      clientId: '2',
      clientName: 'Tech Startup Inc.',
      ltv: 780000,
      acquisitionCost: 12000,
      retentionRate: 88,
      avgAnnualRevenue: 140000,
      yearsAsClient: 3.8,
      projectedFutureValue: 520000
    }
  ];

  const riskData: ClientRiskAssessment[] = [
    {
      clientId: '1',
      clientName: 'Acme Corporation',
      overallRisk: 'Low',
      riskScore: 15,
      factors: {
        paymentRisk: 10,
        scopeCreepRisk: 20,
        communicationRisk: 15,
        expectationRisk: 18,
        complianceRisk: 12
      },
      outstandingBalance: 15000,
      daysOutstanding: 12,
      disputedInvoices: 0,
      lastActivity: '2026-01-02'
    },
    {
      clientId: '3',
      clientName: 'Global Industries LLC',
      overallRisk: 'High',
      riskScore: 78,
      factors: {
        paymentRisk: 85,
        scopeCreepRisk: 72,
        communicationRisk: 68,
        expectationRisk: 80,
        complianceRisk: 65
      },
      outstandingBalance: 125000,
      daysOutstanding: 87,
      disputedInvoices: 3,
      lastActivity: '2025-12-15'
    }
  ];

  const satisfactionData: ClientSatisfaction[] = [
    {
      clientId: '1',
      clientName: 'Acme Corporation',
      nps: 85,
      csat: 92,
      responsiveness: 9.2,
      quality: 9.5,
      value: 8.8,
      likelihood: 9.4,
      lastSurveyDate: '2025-12-20',
      totalSurveys: 8
    },
    {
      clientId: '2',
      clientName: 'Tech Startup Inc.',
      nps: 72,
      csat: 84,
      responsiveness: 8.5,
      quality: 8.8,
      value: 8.2,
      likelihood: 8.6,
      lastSurveyDate: '2025-12-15',
      totalSurveys: 5
    }
  ];

  // Segment data
  const segmentData: ClientSegment[] = [
    { segment: 'Enterprise', count: 15, revenue: 2500000, avgLifetimeValue: 1200000, color: '#3b82f6' },
    { segment: 'Mid-Market', count: 35, revenue: 1800000, avgLifetimeValue: 450000, color: '#10b981' },
    { segment: 'Small Business', count: 50, revenue: 850000, avgLifetimeValue: 85000, color: '#f59e0b' },
    { segment: 'Individual', count: 80, revenue: 320000, avgLifetimeValue: 15000, color: '#8b5cf6' }
  ];

  // Revenue trend data
  const revenueTrendData = [
    { month: 'Jul', revenue: 420000, profit: 168000 },
    { month: 'Aug', revenue: 450000, profit: 180000 },
    { month: 'Sep', revenue: 480000, profit: 192000 },
    { month: 'Oct', revenue: 510000, profit: 204000 },
    { month: 'Nov', revenue: 490000, profit: 196000 },
    { month: 'Dec', revenue: 550000, profit: 220000 }
  ];

  // Calculate aggregate metrics
  const totalProfit = profitabilityData.reduce((acc, p) => acc + p.profit, 0);
  const avgProfitMargin = profitabilityData.reduce((acc, p) => acc + p.profitMargin, 0) / profitabilityData.length;
  const totalLTV = ltvData.reduce((acc, l) => acc + l.ltv, 0);
  const avgNPS = satisfactionData.reduce((acc, s) => acc + s.nps, 0) / satisfactionData.length;
  const highRiskClients = riskData.filter(r => r.overallRisk === 'High' || r.overallRisk === 'Critical').length;

  // ============================================================================
  // RENDER: PROFITABILITY TAB
  // ============================================================================

  const renderProfitabilityTab = () => (
    <div className="space-y-6">
      {/* Revenue & Profit Trend */}
      <Card title="Revenue & Profit Trend (6 Months)">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
              <Tooltip contentStyle={chartTheme.tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={chartColors[0]} strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={chartColors[2]} strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Client Profitability Table */}
      <Card title="Client Profitability Analysis">
        <div className="space-y-3">
          {profitabilityData.map(client => (
            <div
              key={client.clientId}
              className={cn("p-4 rounded-lg border hover:shadow-md transition-all", theme.border.default)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <h4 className={cn("font-bold", theme.text.primary)}>{client.clientName}</h4>
                  {client.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {client.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  {client.trend === 'stable' && <Activity className="h-4 w-4 text-blue-600" />}
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  client.profitMargin >= 35 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                    client.profitMargin >= 20 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {client.profitMargin}% Margin
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Revenue</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>
                    ${(client.totalRevenue / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Costs</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>
                    ${(client.totalCosts / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Profit</p>
                  <p className={cn("text-sm font-bold text-green-600")}>
                    ${(client.profit / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Realization</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>{client.realization}%</p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Collection</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>{client.collectionRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Client Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Segment">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={segmentData as Array<{ segment: string; revenue: number; color: string;[key: string]: string | number }>}
                  dataKey="revenue"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props) => {
                    const payload = (props as { payload?: { segment: string; revenue: number } }).payload;
                    const segment = payload?.segment || (props as { segment?: string }).segment;
                    const revenue = payload?.revenue ?? (props as { revenue?: number }).revenue;
                    return segment && revenue ? `${segment}: $${(revenue / 1000).toFixed(0)}k` : '';
                  }}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Clients by Segment">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                <XAxis dataKey="segment" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 12 }} />
                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: LIFETIME VALUE TAB
  // ============================================================================

  const renderLTVTab = () => (
    <div className="space-y-6">
      <Card title="Client Lifetime Value Analysis">
        <div className="space-y-4">
          {ltvData.map(client => (
            <div
              key={client.clientId}
              className={cn("p-6 rounded-lg border", theme.border.default)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={cn("font-bold text-lg", theme.text.primary)}>{client.clientName}</h4>
                  <p className={cn("text-sm", theme.text.secondary)}>
                    Client for {client.yearsAsClient.toFixed(1)} years
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs", theme.text.tertiary)}>Total LTV</p>
                  <p className={cn("text-2xl font-bold text-green-600")}>
                    ${(client.ltv / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Acquisition Cost</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>
                    ${(client.acquisitionCost / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Avg Annual Revenue</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>
                    ${(client.avgAnnualRevenue / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Retention Rate</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>{client.retentionRate}%</p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>ROI</p>
                  <p className={cn("text-sm font-bold text-green-600")}>
                    {((client.ltv / client.acquisitionCost - 1) * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Projected Future Value</p>
                  <p className={cn("text-sm font-bold", theme.text.primary)}>
                    ${(client.projectedFutureValue / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              {/* LTV Breakdown */}
              <div className={cn("mt-4 pt-4 border-t", theme.border.default)}>
                <p className={cn("text-xs mb-2", theme.text.tertiary)}>LTV Composition</p>
                <div className="flex gap-2">
                  <div
                    className="h-2 rounded bg-green-600"
                    style={{ width: `${(client.ltv - client.projectedFutureValue) / client.ltv * 100}%` }}
                    title="Historical Value"
                  />
                  <div
                    className="h-2 rounded bg-blue-600"
                    style={{ width: `${client.projectedFutureValue / client.ltv * 100}%` }}
                    title="Projected Value"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className={cn("text-xs", theme.text.tertiary)}>
                    Historical: ${((client.ltv - client.projectedFutureValue) / 1000).toFixed(0)}k
                  </span>
                  <span className={cn("text-xs", theme.text.tertiary)}>
                    Projected: ${(client.projectedFutureValue / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // RENDER: RISK ASSESSMENT TAB
  // ============================================================================

  const renderRiskTab = () => (
    <div className="space-y-6">
      <Card title="Client Risk Assessment">
        <div className="space-y-4">
          {riskData.map(client => (
            <div
              key={client.clientId}
              className={cn("p-6 rounded-lg border", theme.border.default)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {client.overallRisk === 'Critical' && <AlertTriangle className="h-6 w-6 text-red-600" />}
                  {client.overallRisk === 'High' && <AlertTriangle className="h-6 w-6 text-orange-600" />}
                  {client.overallRisk === 'Medium' && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
                  {client.overallRisk === 'Low' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                  <div>
                    <h4 className={cn("font-bold", theme.text.primary)}>{client.clientName}</h4>
                    <p className={cn("text-sm", theme.text.secondary)}>
                      Last activity: {client.lastActivity}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  client.overallRisk === 'Critical' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                    client.overallRisk === 'High' ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
                      client.overallRisk === 'Medium' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                )}>
                  {client.overallRisk} Risk ({client.riskScore}/100)
                </span>
              </div>

              {/* Risk Factors */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(client.factors).map(([factor, score]) => (
                  <div key={factor}>
                    <p className={cn("text-xs mb-1", theme.text.tertiary)}>
                      {factor.replace(/([A-Z])/g, ' $1').trim().replace('Risk', '')}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className={cn(
                            "h-full rounded transition-all",
                            score >= 70 ? "bg-red-600" :
                              score >= 40 ? "bg-yellow-600" :
                                "bg-green-600"
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-medium", theme.text.primary)}>{score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Risk Indicators */}
              <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t", theme.border.default)}>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Outstanding Balance</p>
                  <p className={cn("text-lg font-bold", theme.text.primary)}>
                    ${client.outstandingBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Days Outstanding</p>
                  <p className={cn(
                    "text-lg font-bold",
                    client.daysOutstanding > 60 ? "text-red-600" :
                      client.daysOutstanding > 30 ? "text-yellow-600" :
                        theme.text.primary
                  )}>
                    {client.daysOutstanding} days
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Disputed Invoices</p>
                  <p className={cn(
                    "text-lg font-bold",
                    client.disputedInvoices > 0 ? "text-red-600" : theme.text.primary
                  )}>
                    {client.disputedInvoices}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // RENDER: SATISFACTION TAB
  // ============================================================================

  const renderSatisfactionTab = () => (
    <div className="space-y-6">
      <Card title="Client Satisfaction Metrics">
        <div className="space-y-4">
          {satisfactionData.map(client => {
            const radarData = [
              { metric: 'Responsiveness', value: client.responsiveness },
              { metric: 'Quality', value: client.quality },
              { metric: 'Value', value: client.value },
              { metric: 'Likelihood', value: client.likelihood }
            ];

            return (
              <div
                key={client.clientId}
                className={cn("p-6 rounded-lg border", theme.border.default)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={cn("font-bold text-lg", theme.text.primary)}>{client.clientName}</h4>
                    <p className={cn("text-sm", theme.text.secondary)}>
                      Last survey: {client.lastSurveyDate} ({client.totalSurveys} total surveys)
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className={cn("text-xs", theme.text.tertiary)}>NPS</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        client.nps >= 70 ? "text-green-600" :
                          client.nps >= 30 ? "text-yellow-600" :
                            "text-red-600"
                      )}>
                        {client.nps}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={cn("text-xs", theme.text.tertiary)}>CSAT</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        client.csat >= 80 ? "text-green-600" :
                          client.csat >= 60 ? "text-yellow-600" :
                            "text-red-600"
                      )}>
                        {client.csat}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm", theme.text.secondary)}>Responsiveness</span>
                        <span className={cn("text-sm font-bold", theme.text.primary)}>
                          {client.responsiveness}/10
                        </span>
                      </div>
                      <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded bg-blue-600 transition-all"
                          style={{ width: `${client.responsiveness * 10}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm", theme.text.secondary)}>Quality</span>
                        <span className={cn("text-sm font-bold", theme.text.primary)}>
                          {client.quality}/10
                        </span>
                      </div>
                      <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded bg-green-600 transition-all"
                          style={{ width: `${client.quality * 10}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm", theme.text.secondary)}>Value</span>
                        <span className={cn("text-sm font-bold", theme.text.primary)}>
                          {client.value}/10
                        </span>
                      </div>
                      <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded bg-purple-600 transition-all"
                          style={{ width: `${client.value * 10}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm", theme.text.secondary)}>Likelihood to Recommend</span>
                        <span className={cn("text-sm font-bold", theme.text.primary)}>
                          {client.likelihood}/10
                        </span>
                      </div>
                      <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded bg-amber-600 transition-all"
                          style={{ width: `${client.likelihood * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={chartTheme.grid} />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: chartTheme.text, fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 10]} tick={{ fill: chartTheme.text, fontSize: 10 }} />
                        <Radar
                          name={client.clientName}
                          dataKey="value"
                          stroke={chartColors[0]}
                          fill={chartColors[0]}
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Client Profit"
          value={`$${(totalProfit / 1000).toFixed(0)}k`}
          icon={DollarSign}
          trend="+15% YTD"
          trendUp={true}
          className="border-l-4 border-l-green-600"
        />
        <MetricCard
          label="Avg Profit Margin"
          value={`${avgProfitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Total LTV"
          value={`$${(totalLTV / 1000000).toFixed(1)}M`}
          icon={Award}
          trend="+22% vs Last Year"
          trendUp={true}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard
          label="Avg NPS Score"
          value={avgNPS.toFixed(0)}
          icon={Star}
          trend="Promoter Category"
          trendUp={true}
          className="border-l-4 border-l-amber-500"
        />
      </div>

      {/* Risk Alert */}
      {highRiskClients > 0 && (
        <div className={cn("p-4 rounded-lg border-l-4 border-l-red-600", theme.surface.default, "border")}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className={cn("font-medium", theme.text.primary)}>
                {highRiskClients} High-Risk Client{highRiskClients > 1 ? 's' : ''} Require Attention
              </p>
              <p className={cn("text-sm", theme.text.secondary)}>
                Review risk assessment tab for details and recommended actions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6">
          {[
            { id: 'profitability' as const, label: 'Profitability', icon: DollarSign },
            { id: 'ltv' as const, label: 'Lifetime Value', icon: TrendingUp },
            { id: 'risk' as const, label: 'Risk Assessment', icon: AlertTriangle },
            { id: 'satisfaction' as const, label: 'Satisfaction', icon: ThumbsUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : cn("border-transparent", theme.text.secondary, "hover:text-blue-600")
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
        {activeTab === 'profitability' && renderProfitabilityTab()}
        {activeTab === 'ltv' && renderLTVTab()}
        {activeTab === 'risk' && renderRiskTab()}
        {activeTab === 'satisfaction' && renderSatisfactionTab()}
      </div>
    </div>
  );
};

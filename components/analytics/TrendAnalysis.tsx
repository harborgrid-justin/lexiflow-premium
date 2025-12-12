import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendAnalysis: React.FC = () => {
  const trendData = [
    { month: 'Jan', cases: 45, revenue: 420000, winRate: 68 },
    { month: 'Feb', cases: 52, revenue: 485000, winRate: 71 },
    { month: 'Mar', cases: 48, revenue: 450000, winRate: 69 },
    { month: 'Apr', cases: 58, revenue: 520000, winRate: 73 },
    { month: 'May', cases: 62, revenue: 580000, winRate: 75 },
    { month: 'Jun', cases: 67, revenue: 625000, winRate: 72 },
  ];

  const insights = [
    {
      metric: 'Case Volume',
      trend: 'increasing',
      change: 14.8,
      description: 'Case intake up 14.8% over last quarter',
      severity: 'positive',
    },
    {
      metric: 'Revenue',
      trend: 'increasing',
      change: 18.2,
      description: 'Revenue growth accelerating - up 18.2%',
      severity: 'positive',
    },
    {
      metric: 'Win Rate',
      trend: 'stable',
      change: 2.1,
      description: 'Win rate stable with slight improvement',
      severity: 'neutral',
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Practice Area Trends</h3>
        <p className="text-sm text-gray-500">6-month performance analysis</p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cases"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCases)"
                name="Cases"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm mb-3">Key Insights</h4>
          {insights.map((insight, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(insight.trend)}
                  <span className="font-medium text-sm">{insight.metric}</span>
                </div>
                <Badge className={getSeverityColor(insight.severity)}>
                  {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 bg-green-50">
            <p className="text-xs text-gray-600 mb-1">Growth Rate</p>
            <p className="text-xl font-bold text-green-700">+16.2%</p>
            <p className="text-xs text-gray-500">vs last quarter</p>
          </div>
          <div className="border rounded-lg p-3 bg-blue-50">
            <p className="text-xs text-gray-600 mb-1">Forecast</p>
            <p className="text-xl font-bold text-blue-700">$680K</p>
            <p className="text-xs text-gray-500">July revenue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

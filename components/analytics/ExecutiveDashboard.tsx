import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Cases',
      value: '67',
      change: '+12 this month',
      trend: 'up',
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      title: 'Win Rate',
      value: '73%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Team Utilization',
      value: '75%',
      change: '-3%',
      trend: 'down',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  const practiceAreas = [
    { name: 'Litigation', revenue: 980000, percentage: 41, cases: 28 },
    { name: 'Corporate', revenue: 720000, percentage: 30, cases: 22 },
    { name: 'Employment', revenue: 480000, percentage: 20, cases: 12 },
    { name: 'IP', revenue: 220000, percentage: 9, cases: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue by Practice Area */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Revenue by Practice Area</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {practiceAreas.map((area, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{area.name}</span>
                    <span className="text-sm text-gray-500">{area.cases} cases</span>
                  </div>
                  <span className="font-semibold">
                    ${(area.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="absolute top-0 left-0 bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${area.percentage}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {area.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-green-600">38.5%</p>
            <p className="text-xs text-gray-500">+2.3% vs last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Client Retention</p>
            <p className="text-2xl font-bold text-blue-600">87%</p>
            <p className="text-xs text-gray-500">Above industry avg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Realization Rate</p>
            <p className="text-2xl font-bold text-purple-600">85%</p>
            <p className="text-xs text-gray-500">Target: 82%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

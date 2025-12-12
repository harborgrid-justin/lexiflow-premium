import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Target, DollarSign, Briefcase, TrendingUp, Award } from 'lucide-react';

export const AttorneyScorecard: React.FC<{ attorneyId: string }> = ({ attorneyId }) => {
  const performance = {
    name: 'Sarah Johnson',
    title: 'Senior Associate',
    metrics: {
      billableHours: { value: 1825, target: 1700, percentage: 107 },
      revenue: { value: 475000, target: 425000, percentage: 112 },
      winRate: { value: 78, target: 65, percentage: 120 },
      clientSatisfaction: { value: 4.6, target: 4.0, max: 5 },
    },
    rankings: {
      firmRank: 3,
      totalAttorneys: 24,
      percentile: 88,
    },
    achievements: [
      'Revenue 12% above target',
      'Win rate exceeds firm average',
      'High client satisfaction rating',
    ],
    developmentAreas: [
      'Increase new client acquisition',
      'Focus on practice area diversification',
    ],
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600 bg-green-50';
    if (percentage >= 90) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-4 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{performance.name}</h2>
              <p className="text-gray-600">{performance.title}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-yellow-500" />
                <Badge className="bg-blue-100 text-blue-800">
                  Rank #{performance.rankings.firmRank} of {performance.rankings.totalAttorneys}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {performance.rankings.percentile}th percentile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Billable Hours</span>
              </div>
              <Badge className={getPerformanceColor(performance.metrics.billableHours.percentage)}>
                {performance.metrics.billableHours.percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual</span>
                <span className="font-semibold">{performance.metrics.billableHours.value}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target</span>
                <span>{performance.metrics.billableHours.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${getProgressColor(performance.metrics.billableHours.percentage)}`}
                  style={{ width: `${Math.min(performance.metrics.billableHours.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Revenue Generated</span>
              </div>
              <Badge className={getPerformanceColor(performance.metrics.revenue.percentage)}>
                {performance.metrics.revenue.percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual</span>
                <span className="font-semibold">${(performance.metrics.revenue.value / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target</span>
                <span>${(performance.metrics.revenue.target / 1000).toFixed(0)}K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${getProgressColor(performance.metrics.revenue.percentage)}`}
                  style={{ width: `${Math.min(performance.metrics.revenue.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Win Rate</span>
              </div>
              <Badge className={getPerformanceColor(performance.metrics.winRate.percentage)}>
                {performance.metrics.winRate.percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual</span>
                <span className="font-semibold">{performance.metrics.winRate.value}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target</span>
                <span>{performance.metrics.winRate.target}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${getProgressColor(performance.metrics.winRate.percentage)}`}
                  style={{ width: `${Math.min(performance.metrics.winRate.percentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Client Satisfaction</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {performance.metrics.clientSatisfaction.value} / {performance.metrics.clientSatisfaction.max}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${
                      star <= performance.metrics.clientSatisfaction.value
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600">Exceeds target of {performance.metrics.clientSatisfaction.target}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements & Development */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Key Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performance.achievements.map((achievement, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Development Areas
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performance.developmentAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

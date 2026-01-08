import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { attorneyPerformanceApi } from './utils/api';
import type { AttorneyPerformanceMetrics as APMetrics } from './types';
import { Award, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface AttorneyPerformanceProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

export const AttorneyPerformance: React.FC<AttorneyPerformanceProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [attorneys, setAttorneys] = useState<APMetrics[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [performanceData, leaderboardData] = await Promise.all([
        attorneyPerformanceApi.getPerformance({ organizationId, startDate, endDate }),
        attorneyPerformanceApi.getLeaderboard(organizationId, 'revenue', 10),
      ]);
      setAttorneys(performanceData);
      setLeaderboard(leaderboardData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'top':
        return 'bg-purple-100 text-purple-800';
      case 'high':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Attorney Performance</h1>

      {/* Leaderboard */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Top Performers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((attorney, index) => (
            <div key={attorney.attorneyId} className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">#{index + 1}</span>
                {attorney.change > 0 && (
                  <span className="text-green-300 text-sm">+{attorney.change}%</span>
                )}
              </div>
              <p className="font-semibold text-lg">{attorney.name}</p>
              <p className="text-white/80 text-sm">${attorney.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attorney Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {attorneys.map((attorney) => (
          <div key={attorney.attorneyId} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{attorney.name}</h3>
                <p className="text-sm text-gray-600">{attorney.title}</p>
                <p className="text-sm text-gray-600">{attorney.practiceGroup}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(
                  attorney.performance.tier,
                )}`}
              >
                {attorney.performance.tier.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Revenue</p>
                  <p className="text-lg font-semibold">${attorney.revenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Billable Hours</p>
                  <p className="text-lg font-semibold">{attorney.billableHours}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilization Rate</span>
                  <span className="font-medium">{attorney.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${attorney.utilizationRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Realization Rate</span>
                  <span className="font-medium">{attorney.realizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${attorney.realizationRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Collection Rate</span>
                  <span className="font-medium">{attorney.collectionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${attorney.collectionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Cases</p>
                <p className="text-lg font-semibold">{attorney.activeCases}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Clients</p>
                <p className="text-lg font-semibold">{attorney.clientCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Rate</p>
                <p className="text-lg font-semibold">${attorney.averageHourlyRate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attorney
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((attorney) => (
                <tr key={attorney.attorneyId}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{attorney.rank}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attorney.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${attorney.value.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      className={
                        attorney.change > 0
                          ? 'text-green-600'
                          : attorney.change < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }
                    >
                      {attorney.change > 0 ? '+' : ''}
                      {attorney.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

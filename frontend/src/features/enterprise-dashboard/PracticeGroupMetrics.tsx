import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { practiceGroupApi } from './utils/api';
import type { PracticeGroupMetrics as PGMetrics } from './types';

interface PracticeGroupMetricsProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

export const PracticeGroupMetrics: React.FC<PracticeGroupMetricsProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [metrics, setMetrics] = useState<PGMetrics[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, comparisonData] = await Promise.all([
        practiceGroupApi.getMetrics({ organizationId, startDate, endDate }),
        practiceGroupApi.getComparison({ organizationId, startDate, endDate }),
      ]);
      setMetrics(metricsData);
      setComparison(comparisonData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Practice Group Metrics</h1>

      {/* Metric Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {['revenue', 'utilization', 'profitMargin'].map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
      </div>

      {/* Practice Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((pg) => (
          <div key={pg.practiceGroupId} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{pg.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-lg font-bold text-gray-900">
                  ${pg.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth</span>
                <span className="text-sm font-medium text-green-600">
                  +{pg.revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Cases</span>
                <span className="text-sm font-medium">{pg.activeCases}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Utilization</span>
                <span className="text-sm font-medium">{pg.utilizationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="text-sm font-medium">{pg.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      {comparison && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Practice Group Comparison
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metrics.map((pg, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                return (
                  <Bar
                    key={pg.practiceGroupId}
                    dataKey={`practiceGroups[${index}].value`}
                    fill={colors[index % colors.length]}
                    name={pg.name}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

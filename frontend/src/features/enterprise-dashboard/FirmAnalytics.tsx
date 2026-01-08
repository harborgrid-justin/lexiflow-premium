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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { firmAnalyticsApi } from './utils/api';
import { TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';

interface FirmAnalyticsProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

export const FirmAnalytics: React.FC<FirmAnalyticsProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [data, setData] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, benchmarkData] = await Promise.all([
        firmAnalyticsApi.getAnalytics({ organizationId, startDate, endDate }),
        firmAnalyticsApi.getBenchmarks(organizationId),
      ]);
      setData(analyticsData);
      setBenchmarks(benchmarkData);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Firm Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                ${data.overview.totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mt-4">
            +{data.trends.revenueGrowth}% from last period
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Net Profit</p>
              <p className="text-3xl font-bold mt-2">
                ${data.overview.netProfit.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mt-4">
            {data.overview.profitMargin.toFixed(1)}% margin
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Cases</p>
              <p className="text-3xl font-bold mt-2">{data.overview.totalCases}</p>
            </div>
            <Briefcase className="w-12 h-12 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm mt-4">
            +{data.trends.caseGrowth}% growth
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Attorneys</p>
              <p className="text-3xl font-bold mt-2">{data.overview.totalAttorneys}</p>
            </div>
            <Users className="w-12 h-12 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm mt-4">Across all offices</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.departmentBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="utilization" fill="#10b981" name="Utilization (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmarking */}
      {benchmarks && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Benchmarking</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={benchmarks.metrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Firm Performance"
                dataKey="firmValue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="Industry Average"
                dataKey="industryAverage"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Office Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Office
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Clients
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Attorneys
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.officeBreakdown.map((office: any) => (
                <tr key={office.office}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {office.office}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${office.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {office.clients}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {office.attorneys}
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

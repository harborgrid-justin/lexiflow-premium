import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KPICard } from './components/KPICard';
import { executiveDashboardApi } from './utils/api';
import { useAnalyticsWebSocket } from './hooks/useAnalyticsWebSocket';
import type { ExecutiveDashboardData } from './types';
import { RefreshCw, Download } from 'lucide-react';

interface ExecutiveDashboardProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, lastMessage, subscribe, refresh } = useAnalyticsWebSocket({
    userId: organizationId,
  });

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  useEffect(() => {
    if (isConnected) {
      subscribe({
        dashboardType: 'executive',
        filters: { organizationId, startDate, endDate },
      });
    }
  }, [isConnected, organizationId, startDate, endDate]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'executive') {
      setData(lastMessage.data);
    }
  }, [lastMessage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await executiveDashboardApi.getOverview({
        organizationId,
        startDate,
        endDate,
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isConnected) {
      refresh('executive');
    } else {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and key performance indicators
            {isConnected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Revenue" data={data.kpis.revenue} format="currency" />
        <KPICard title="Profit Margin" data={data.kpis.profitMargin} format="percentage" />
        <KPICard title="Utilization Rate" data={data.kpis.utilizationRate} format="percentage" />
        <KPICard title="Realization Rate" data={data.kpis.realizationRate} format="percentage" />
        <KPICard title="Active Cases" data={data.kpis.activeCases} />
        <KPICard title="Active Clients" data={data.kpis.activeClients} />
        <KPICard title="Billable Hours" data={data.kpis.billableHours} />
        <KPICard title="Collection Rate" data={data.kpis.collectionRate} format="percentage" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cases by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.casesByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.charts.casesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Practice Groups */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Practice Groups by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.topPracticeGroups} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attorney Utilization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attorney Utilization by Level
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.attorneyUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
              <Bar dataKey="target" fill="#10b981" name="Target %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

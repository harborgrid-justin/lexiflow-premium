import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { clientAnalyticsApi } from './utils/api';
import type { ClientProfitabilityMetrics as CPMetrics } from './types';
import { TrendingUp, Award, Users } from 'lucide-react';

interface ClientProfitabilityProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

const TIER_COLORS = {
  platinum: '#8b5cf6',
  gold: '#f59e0b',
  silver: '#6b7280',
  bronze: '#92400e',
};

export const ClientProfitability: React.FC<ClientProfitabilityProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [clients, setClients] = useState<CPMetrics[]>([]);
  const [segmentation, setSegmentation] = useState<any[]>([]);
  const [retention, setRetention] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, segmentationData, retentionData] = await Promise.all([
        clientAnalyticsApi.getProfitability({ organizationId, startDate, endDate }),
        clientAnalyticsApi.getSegmentation(organizationId),
        clientAnalyticsApi.getRetention({ organizationId, startDate, endDate }),
      ]);
      setClients(clientsData);
      setSegmentation(segmentationData);
      setRetention(retentionData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Client Profitability</h1>

      {/* Client Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Segmentation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ tier, percentOfRevenue }) =>
                  `${tier} ${percentOfRevenue.toFixed(1)}%`
                }
                outerRadius={100}
                dataKey="revenue"
              >
                {segmentation.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TIER_COLORS[entry.tier.toLowerCase() as keyof typeof TIER_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Analysis */}
        {retention && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Retention</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {retention.retentionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Retention Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {retention.churnRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Churn Rate</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retention.retentionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 95]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.clientId}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4"
            style={{
              borderColor: TIER_COLORS[client.tier],
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                  style={{
                    backgroundColor: `${TIER_COLORS[client.tier]}20`,
                    color: TIER_COLORS[client.tier],
                  }}
                >
                  {client.tier.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${client.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Profit</p>
                <p className="text-lg font-semibold text-green-600">
                  ${client.profit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Margin</p>
                <p className="text-lg font-semibold">{client.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Cases</span>
                <span className="font-medium">{client.activeCases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Billed Hours</span>
                <span className="font-medium">{client.billedHours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collection Rate</span>
                <span className="font-medium">{client.collectionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Satisfaction</span>
                <span className="font-medium">{client.satisfactionScore.toFixed(1)}/10</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Lifetime Value</p>
                  <p className="text-lg font-semibold">
                    ${client.lifetimeValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Retention</p>
                  <p className="text-lg font-semibold">{client.retentionMonths}mo</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Tier Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Clients
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {segmentation.map((tier) => (
                <tr key={tier.tier}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${TIER_COLORS[tier.tier.toLowerCase() as keyof typeof TIER_COLORS]}20`,
                        color:
                          TIER_COLORS[tier.tier.toLowerCase() as keyof typeof TIER_COLORS],
                      }}
                    >
                      {tier.tier}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {tier.count}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${tier.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {tier.percentOfRevenue.toFixed(1)}%
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

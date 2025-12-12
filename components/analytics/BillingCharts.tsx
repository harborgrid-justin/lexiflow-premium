import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface BillingData {
  revenue: number;
  collected: number;
  outstanding: number;
  realizationRate: number;
  utilizationRate: number;
  avgHourlyRate: number;
  totalHours: number;
  byAttorney: Array<{
    name: string;
    hours: number;
    revenue: number;
    realization: number;
  }>;
  byPracticeArea: Array<{
    area: string;
    revenue: number;
    hours: number;
  }>;
  trends: Array<{
    period: string;
    revenue: number;
    hours: number;
  }>;
}

interface BillingChartsProps {
  startDate?: Date;
  endDate?: Date;
}

export const BillingCharts: React.FC<BillingChartsProps> = ({ startDate, endDate }) => {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attorney' | 'area'>('overview');

  useEffect(() => {
    loadBillingData();
  }, [startDate, endDate]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const billingData = await analyticsService.getBillingAnalytics({
        startDate,
        endDate,
      });
      setData(billingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(data.revenue)}
          icon="💵"
          color="blue"
        />
        <SummaryCard
          title="Collected"
          value={formatCurrency(data.collected)}
          subtitle={`${data.realizationRate.toFixed(1)}% realization`}
          icon="✅"
          color="green"
        />
        <SummaryCard
          title="Outstanding"
          value={formatCurrency(data.outstanding)}
          icon="⏳"
          color="yellow"
        />
        <SummaryCard
          title="Total Hours"
          value={data.totalHours.toLocaleString()}
          subtitle={`$${data.avgHourlyRate}/hr avg`}
          icon="⏱️"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'attorney'}
              onClick={() => setActiveTab('attorney')}
              label="By Attorney"
            />
            <TabButton
              active={activeTab === 'area'}
              onClick={() => setActiveTab('area')}
              label="By Practice Area"
            />
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue Trend Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue Trend</h4>
                <div className="space-y-2">
                  {data.trends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">{trend.period}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(trend.revenue / Math.max(...data.trends.map(t => t.revenue))) * 100}%`,
                            }}
                          >
                            <span className="text-xs font-medium text-white">
                              {formatCurrency(trend.revenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-sm text-gray-600 text-right">
                        {trend.hours} hrs
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <MetricBox
                  label="Utilization Rate"
                  value={`${data.utilizationRate.toFixed(1)}%`}
                  description="Billable hours percentage"
                />
                <MetricBox
                  label="Realization Rate"
                  value={`${data.realizationRate.toFixed(1)}%`}
                  description="Collection efficiency"
                />
              </div>
            </div>
          )}

          {activeTab === 'attorney' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Attorney Performance</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Attorney
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Realization
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.byAttorney.map((attorney, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attorney.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {attorney.hours.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(attorney.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              attorney.realization >= 90
                                ? 'bg-green-100 text-green-800'
                                : attorney.realization >= 75
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {attorney.realization.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'area' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Revenue by Practice Area</h4>
              <div className="space-y-3">
                {data.byPracticeArea.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{area.area}</div>
                      <div className="text-xs text-gray-500 mt-1">{area.hours} hours</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(area.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((area.revenue / data.revenue) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({
  active,
  onClick,
  label,
}) => (
  <button
    onClick={onClick}
    className={`py-4 px-1 border-b-2 font-medium text-sm ${
      active
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

const MetricBox: React.FC<{ label: string; value: string; description: string }> = ({
  label,
  value,
  description,
}) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{description}</div>
  </div>
);

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default BillingCharts;

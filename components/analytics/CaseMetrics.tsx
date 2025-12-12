import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface CaseMetricsData {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  winRate: number;
  lossRate: number;
  settlementRate: number;
  avgCaseDuration: number;
  medianCaseDuration: number;
  avgCaseValue: number;
  totalRevenue: number;
  casesByStatus: Record<string, number>;
  casesByPracticeArea: Record<string, number>;
}

interface CaseMetricsProps {
  startDate?: Date;
  endDate?: Date;
  practiceArea?: string;
  status?: string;
}

export const CaseMetrics: React.FC<CaseMetricsProps> = ({
  startDate,
  endDate,
  practiceArea,
  status,
}) => {
  const [metrics, setMetrics] = useState<CaseMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate, practiceArea, status]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getCaseMetrics({
        startDate,
        endDate,
        practiceArea,
        status,
      });
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
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

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cases"
          value={metrics.totalCases}
          subtitle={`${metrics.activeCases} active`}
          icon="📊"
          trend="+12%"
          trendDirection="up"
        />
        <MetricCard
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          subtitle="Success rate"
          icon="🏆"
          trend="+3.2%"
          trendDirection="up"
        />
        <MetricCard
          title="Avg Duration"
          value={`${metrics.avgCaseDuration}`}
          subtitle="days"
          icon="⏱️"
          trend="-8 days"
          trendDirection="down"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Billed amount"
          icon="💰"
          trend="+18%"
          trendDirection="up"
        />
      </div>

      {/* Outcome Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Won</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics.settlementRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Settled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{metrics.lossRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Lost</div>
          </div>
        </div>
      </div>

      {/* Cases by Practice Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Practice Area</h3>
        <div className="space-y-3">
          {Object.entries(metrics.casesByPracticeArea).map(([area, count]) => (
            <div key={area} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{area}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(count / metrics.totalCases) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases by Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.casesByStatus).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 mt-1 capitalize">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'neutral',
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-4 text-sm font-medium ${trendColors[trendDirection]}`}>
          {trendDirection === 'up' && '↑ '}
          {trendDirection === 'down' && '↓ '}
          {trend} from last period
        </div>
      )}
    </div>
  );
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default CaseMetrics;

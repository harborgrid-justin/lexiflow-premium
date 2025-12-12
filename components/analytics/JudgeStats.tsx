import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface JudgeStatistics {
  judgeId: string;
  judgeName: string;
  court: string;
  totalCases: number;
  settlementRate: number;
  plaintiffWinRate: number;
  defendantWinRate: number;
  dismissalRate: number;
  avgCaseDuration: number;
  avgSettlementAmount: number;
  motionGrantRate: {
    summary: number;
    dismiss: number;
    discovery: number;
  };
  casesByType: Record<string, number>;
  trialHistory: Array<{
    outcome: string;
    duration: number;
    year: number;
  }>;
}

interface JudgeStatsProps {
  judgeId?: string;
  onJudgeSelect?: (judgeId: string) => void;
}

export const JudgeStats: React.FC<JudgeStatsProps> = ({ judgeId, onJudgeSelect }) => {
  const [judges, setJudges] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedJudge, setSelectedJudge] = useState<string | undefined>(judgeId);
  const [stats, setStats] = useState<JudgeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJudgeList();
  }, []);

  useEffect(() => {
    if (selectedJudge) {
      loadJudgeStats(selectedJudge);
    }
  }, [selectedJudge]);

  const loadJudgeList = async () => {
    try {
      const judgeList = await analyticsService.getJudgeList();
      setJudges(judgeList);
      if (!selectedJudge && judgeList.length > 0) {
        setSelectedJudge(judgeList[0].id);
      }
    } catch (err) {
      console.error('Failed to load judge list:', err);
    }
  };

  const loadJudgeStats = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getJudgeStatistics(id);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load judge statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeChange = (id: string) => {
    setSelectedJudge(id);
    onJudgeSelect?.(id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
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

  return (
    <div className="space-y-6">
      {/* Judge Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Judge</label>
        <select
          value={selectedJudge}
          onChange={(e) => handleJudgeChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a judge...</option>
          {judges.map((judge) => (
            <option key={judge.id} value={judge.id}>
              {judge.name}
            </option>
          ))}
        </select>
      </div>

      {stats && (
        <>
          {/* Judge Info Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{stats.judgeName}</h2>
                <p className="text-blue-100 mt-1">{stats.court}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalCases}</div>
                <div className="text-sm text-blue-100">Total Cases</div>
              </div>
            </div>
          </div>

          {/* Outcome Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OutcomeCard
                label="Settlement"
                percentage={stats.settlementRate}
                color="blue"
                icon="🤝"
              />
              <OutcomeCard
                label="Plaintiff Win"
                percentage={stats.plaintiffWinRate}
                color="green"
                icon="✅"
              />
              <OutcomeCard
                label="Defendant Win"
                percentage={stats.defendantWinRate}
                color="yellow"
                icon="⚖️"
              />
              <OutcomeCard
                label="Dismissal"
                percentage={stats.dismissalRate}
                color="gray"
                icon="❌"
              />
            </div>
          </div>

          {/* Case Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration & Settlement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Metrics</h3>
              <div className="space-y-4">
                <MetricRow
                  label="Average Case Duration"
                  value={`${stats.avgCaseDuration} days`}
                  subtext="From filing to resolution"
                />
                <MetricRow
                  label="Average Settlement"
                  value={formatCurrency(stats.avgSettlementAmount)}
                  subtext="When settled"
                />
              </div>
            </div>

            {/* Motion Success Rates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Motion Success Rates</h3>
              <div className="space-y-3">
                <MotionBar
                  label="Summary Judgment"
                  percentage={stats.motionGrantRate.summary}
                />
                <MotionBar label="Motion to Dismiss" percentage={stats.motionGrantRate.dismiss} />
                <MotionBar
                  label="Discovery Motions"
                  percentage={stats.motionGrantRate.discovery}
                />
              </div>
            </div>
          </div>

          {/* Cases by Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Type</h3>
            <div className="space-y-3">
              {Object.entries(stats.casesByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{type}</span>
                    <div className="flex items-center gap-3 flex-1 max-w-md ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-600 h-6 flex items-center justify-end pr-2"
                          style={{
                            width: `${(count / stats.totalCases) * 100}%`,
                          }}
                        >
                          {count > 0 && (
                            <span className="text-xs font-medium text-white">{count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {((count / stats.totalCases) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Trial History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trial History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration (days)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.trialHistory.map((trial, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trial.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeBadgeColor(
                            trial.outcome,
                          )}`}
                        >
                          {trial.outcome}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trial.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Key Insights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • High settlement rate ({stats.settlementRate.toFixed(1)}%) suggests preference
                    for negotiated resolutions
                  </li>
                  <li>
                    • Average case duration of {stats.avgCaseDuration} days compared to national
                    average
                  </li>
                  <li>
                    • Motion practice shows {stats.motionGrantRate.summary.toFixed(1)}% summary
                    judgment grant rate
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const OutcomeCard: React.FC<{
  label: string;
  percentage: number;
  color: 'blue' | 'green' | 'yellow' | 'gray';
  icon: string;
}> = ({ label, percentage, color, icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg border p-4 text-center`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string; subtext: string }> = ({
  label,
  value,
  subtext,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
    <div className="text-xs text-gray-500">{subtext}</div>
  </div>
);

const MotionBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

function getOutcomeBadgeColor(outcome: string): string {
  const colors: Record<string, string> = {
    settlement: 'bg-blue-100 text-blue-800',
    plaintiff: 'bg-green-100 text-green-800',
    defendant: 'bg-yellow-100 text-yellow-800',
    dismissal: 'bg-gray-100 text-gray-800',
  };
  return colors[outcome.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default JudgeStats;

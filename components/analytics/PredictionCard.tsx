import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface PredictionData {
  caseId: string;
  predictedOutcome: string;
  confidenceLevel: string;
  confidenceScore: number;
  probabilities: Record<string, number>;
  influencingFactors: Array<{
    name: string;
    description: string;
    weight: number;
    impact: string;
  }>;
  settlementRange?: {
    min: number;
    max: number;
    median: number;
  };
  predictedDuration: number;
  riskFactors: Array<{
    category: string;
    level: string;
    description: string;
    probability: number;
  }>;
  recommendations: string[];
}

interface PredictionCardProps {
  caseId: string;
  onRefresh?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ caseId, onRefresh }) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('outcome');

  useEffect(() => {
    loadPrediction();
  }, [caseId]);

  const loadPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getOutcomePrediction(caseId);
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadPrediction();
    onRefresh?.();
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
        <button
          onClick={loadPrediction}
          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!prediction) return null;

  const outcomeColors: Record<string, string> = {
    settlement: 'bg-blue-100 text-blue-800 border-blue-200',
    plaintiffWin: 'bg-green-100 text-green-800 border-green-200',
    defendantWin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dismissal: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const outcomeLabels: Record<string, string> = {
    settlement: 'Settlement',
    plaintiffWin: 'Plaintiff Win',
    defendantWin: 'Defendant Win',
    dismissal: 'Dismissal',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Outcome Prediction</h3>
          <p className="text-sm text-gray-500 mt-1">
            ML-powered analysis based on historical case data
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Predicted Outcome */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Predicted Outcome</div>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${
                outcomeColors[prediction.predictedOutcome] || outcomeColors.settlement
              }`}
            >
              <span className="text-2xl font-bold">
                {outcomeLabels[prediction.predictedOutcome] || prediction.predictedOutcome}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600 mb-2">Confidence</div>
            <div className="text-4xl font-bold text-gray-900">{prediction.confidenceScore}%</div>
            <div className="text-xs text-gray-500 mt-1 uppercase">{prediction.confidenceLevel}</div>
          </div>
        </div>

        {/* Probability Distribution */}
        <div className="mt-6 space-y-2">
          {Object.entries(prediction.probabilities).map(([outcome, probability]) => (
            <div key={outcome} className="flex items-center gap-3">
              <div className="w-32 text-sm text-gray-700">{outcomeLabels[outcome] || outcome}</div>
              <div className="flex-1 bg-white rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2 transition-all"
                  style={{ width: `${probability}%` }}
                >
                  {probability > 10 && (
                    <span className="text-xs font-medium text-white">{probability}%</span>
                  )}
                </div>
              </div>
              {probability <= 10 && (
                <span className="text-xs font-medium text-gray-600 w-12">{probability}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settlement Range (if applicable) */}
      {prediction.settlementRange && (
        <div className="px-6 py-4 bg-blue-50 border-y border-blue-100">
          <div className="text-sm font-medium text-gray-700 mb-3">Projected Settlement Range</div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Minimum</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(prediction.settlementRange.min)}
              </div>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Median</div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(prediction.settlementRange.median)}
              </div>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-yellow-300 to-red-300 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Maximum</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(prediction.settlementRange.max)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Sections */}
      <div className="divide-y divide-gray-200">
        {/* Influencing Factors */}
        <ExpandableSection
          title="Influencing Factors"
          count={prediction.influencingFactors.length}
          expanded={expandedSection === 'factors'}
          onToggle={() => setExpandedSection(expandedSection === 'factors' ? null : 'factors')}
        >
          <div className="space-y-4">
            {prediction.influencingFactors.map((factor, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{factor.name}</h4>
                    <span className="text-xs font-semibold text-gray-600">
                      {(factor.weight * 100).toFixed(0)}% weight
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        factor.impact === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : factor.impact === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {factor.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Risk Factors */}
        <ExpandableSection
          title="Risk Factors"
          count={prediction.riskFactors.length}
          expanded={expandedSection === 'risks'}
          onToggle={() => setExpandedSection(expandedSection === 'risks' ? null : 'risks')}
        >
          <div className="space-y-3">
            {prediction.riskFactors.map((risk, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  risk.level === 'high'
                    ? 'bg-red-50 border-red-500'
                    : risk.level === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{risk.category}</span>
                  <span className="text-xs font-semibold text-gray-600">
                    {risk.probability}% likelihood
                  </span>
                </div>
                <p className="text-sm text-gray-600">{risk.description}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Recommendations */}
        <ExpandableSection
          title="Recommendations"
          count={prediction.recommendations.length}
          expanded={expandedSection === 'recommendations'}
          onToggle={() =>
            setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')
          }
        >
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 pt-0.5">{rec}</span>
              </li>
            ))}
          </ul>
        </ExpandableSection>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
        Predictions are based on historical data and ML models. Not legal advice.
      </div>
    </div>
  );
};

const ExpandableSection: React.FC<{
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, count, expanded, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          {count}
        </span>
      </div>
      <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
    </button>
    {expanded && <div className="px-6 pb-4">{children}</div>}
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

export default PredictionCard;

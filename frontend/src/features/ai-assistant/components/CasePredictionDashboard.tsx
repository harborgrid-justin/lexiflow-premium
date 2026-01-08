/**
 * Case Prediction Dashboard Component
 * Display AI-powered case outcome predictions with analytics
 */

import React from 'react';
import { TrendingUp, DollarSign, Clock, Target, AlertCircle } from 'lucide-react';
import type { CasePrediction } from '../types';

export interface CasePredictionDashboardProps {
  prediction: CasePrediction;
  className?: string;
}

export function CasePredictionDashboard({ prediction, className }: CasePredictionDashboardProps) {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'PLAINTIFF_WIN':
        return 'bg-green-500';
      case 'DEFENDANT_WIN':
        return 'bg-red-500';
      case 'SETTLEMENT':
        return 'bg-blue-500';
      case 'DISMISSAL':
        return 'bg-gray-500';
      case 'MIXED':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Case Outcome Prediction</h2>
            <p className="text-sm text-emerald-100">AI-powered predictive analytics</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-600 font-medium">Predicted Outcome</p>
            </div>
            <p className="text-lg font-semibold text-emerald-900">
              {prediction.primaryOutcome.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              {(prediction.primaryOutcomeProbability * 100).toFixed(0)}% probability
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">Confidence</p>
            </div>
            <p className="text-lg font-semibold text-blue-900">
              {(prediction.overallConfidence * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Based on {prediction.similarCasesAnalyzed} cases
            </p>
          </div>

          {prediction.estimatedDurationMonths && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-purple-600 font-medium">Est. Duration</p>
              </div>
              <p className="text-lg font-semibold text-purple-900">
                {prediction.estimatedDurationMonths} months
              </p>
            </div>
          )}

          {prediction.estimatedCost && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-600 font-medium">Est. Cost</p>
              </div>
              <p className="text-lg font-semibold text-orange-900">
                {formatCurrency(prediction.estimatedCost)}
              </p>
            </div>
          )}
        </div>

        {/* Outcome Probabilities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Outcome Probabilities</h3>
          <div className="space-y-3">
            {prediction.outcomeProbabilities
              .sort((a, b) => b.probability - a.probability)
              .map((outcome) => (
                <div key={outcome.outcome}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {outcome.outcome.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(outcome.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getOutcomeColor(outcome.outcome)}`}
                      style={{ width: `${outcome.probability * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{outcome.reasoning}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Settlement Range */}
        {prediction.settlementRange && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Settlement Range</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-700">Minimum</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatCurrency(prediction.settlementRange.minimum)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Most Likely</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatCurrency(prediction.settlementRange.mostLikely)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Maximum</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatCurrency(prediction.settlementRange.maximum)}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Confidence: {(prediction.settlementRange.confidence * 100).toFixed(0)}%
            </p>
          </div>
        )}

        {/* Key Factors */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Factors</h3>
          <div className="space-y-2">
            {prediction.factors
              .sort((a, b) => b.weight - a.weight)
              .map((factor) => (
                <div
                  key={factor.id}
                  className={`p-3 rounded-lg border ${
                    factor.impact === 'POSITIVE'
                      ? 'bg-green-50 border-green-200'
                      : factor.impact === 'NEGATIVE'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${
                      factor.impact === 'POSITIVE'
                        ? 'text-green-600'
                        : factor.impact === 'NEGATIVE'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{factor.category}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white">
                          {factor.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{factor.description}</p>
                      <p className="text-xs text-gray-600 mt-1">{factor.explanation}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="text-xs">
                          <span className="text-gray-500">Weight:</span>{' '}
                          <span className="font-medium">{(factor.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Confidence:</span>{' '}
                          <span className="font-medium">{(factor.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Summary & Recommendations */}
        {(prediction.summary || prediction.recommendations) && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {prediction.summary && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{prediction.summary}</p>
              </div>
            )}
            {prediction.recommendations && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{prediction.recommendations}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

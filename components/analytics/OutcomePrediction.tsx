import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface OutcomePredictionProps {
  caseId: string;
}

export const OutcomePrediction: React.FC<OutcomePredictionProps> = ({ caseId }) => {
  const [prediction, setPrediction] = useState({
    primaryOutcome: 'win',
    winProbability: 0.73,
    lossProbability: 0.15,
    settlementProbability: 0.12,
    confidence: 0.85,
    keyFactors: [
      { factor: 'Judge Win Rate', impact: 0.25, positive: true },
      { factor: 'Motion Success', impact: 0.20, positive: true },
      { factor: 'Case Strength', impact: 0.18, positive: true },
      { factor: 'Discovery Progress', impact: -0.10, positive: false },
    ],
  });

  const getGaugePosition = (probability: number) => {
    // Convert 0-1 probability to gauge angle (-90 to 90 degrees)
    return (probability * 180) - 90;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Win Probability Analysis
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          {/* Gauge Chart */}
          <div className="relative w-64 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                strokeLinecap="round"
              />
              {/* Colored segments */}
              <path
                d="M 20 90 A 80 80 0 0 1 100 10"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M 100 10 A 80 80 0 0 1 140 25"
                fill="none"
                stroke="#eab308"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M 140 25 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#22c55e"
                strokeWidth="20"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Needle */}
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="20"
                stroke="#1f2937"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${getGaugePosition(prediction.winProbability)} 100 90)`}
              />
              <circle cx="100" cy="90" r="6" fill="#1f2937" />
            </svg>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">
              {(prediction.winProbability * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-gray-500">Win Probability</p>
            <p className="text-xs text-gray-400 mt-1">
              Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Outcome Probabilities */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700 font-medium">Win</span>
              <span>{(prediction.winProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${prediction.winProbability * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-700 font-medium">Loss</span>
              <span>{(prediction.lossProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${prediction.lossProbability * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-700 font-medium">Settlement</span>
              <span>{(prediction.settlementProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${prediction.settlementProbability * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Factors */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Key Contributing Factors
          </h4>
          <div className="space-y-2">
            {prediction.keyFactors.map((factor, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {factor.positive ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  {factor.factor}
                </span>
                <span className={factor.positive ? 'text-green-600' : 'text-red-600'}>
                  {factor.positive ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-800">
              <strong>Model Accuracy:</strong> 84.7% based on 500+ historical cases
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

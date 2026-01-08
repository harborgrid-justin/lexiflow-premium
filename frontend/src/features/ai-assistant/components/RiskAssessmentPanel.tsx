/**
 * Risk Assessment Panel Component
 * Visual dashboard for displaying risk analysis
 */

import React from 'react';
import { AlertTriangle, Shield, TrendingUp, Info } from 'lucide-react';
import type { RiskDetection } from '../types';

export interface RiskAssessmentPanelProps {
  risks: RiskDetection[];
  overallRiskScore?: number;
  className?: string;
}

export function RiskAssessmentPanel({ risks, overallRiskScore, className }: RiskAssessmentPanelProps) {
  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-600',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
        };
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'Critical', color: 'text-red-700', bgColor: 'bg-red-500' };
    if (score >= 50) return { level: 'High', color: 'text-orange-700', bgColor: 'bg-orange-500' };
    if (score >= 25) return { level: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-500' };
    return { level: 'Low', color: 'text-green-700', bgColor: 'bg-green-500' };
  };

  const severityCounts = risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskLevel = overallRiskScore ? getRiskLevel(overallRiskScore) : null;

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Risk Assessment</h2>
            <p className="text-sm text-red-100">Comprehensive risk analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Risk Score */}
        {overallRiskScore !== undefined && riskLevel && (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Risk Score</h3>
                <p className={`text-3xl font-bold ${riskLevel.color}`}>
                  {overallRiskScore}/100
                </p>
                <p className={`text-sm font-medium mt-1 ${riskLevel.color}`}>
                  {riskLevel.level} Risk
                </p>
              </div>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallRiskScore / 100)}`}
                    className={riskLevel.color.replace('text-', 'text-')}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertTriangle className={`w-12 h-12 ${riskLevel.color}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-2xl font-bold text-red-700">
              {severityCounts['CRITICAL'] || 0}
            </p>
            <p className="text-xs text-red-600 font-medium mt-1">Critical</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <p className="text-2xl font-bold text-orange-700">
              {severityCounts['HIGH'] || 0}
            </p>
            <p className="text-xs text-orange-600 font-medium mt-1">High</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {severityCounts['MEDIUM'] || 0}
            </p>
            <p className="text-xs text-yellow-600 font-medium mt-1">Medium</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {severityCounts['LOW'] || 0}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">Low</p>
          </div>
        </div>

        {/* Risk List */}
        {risks.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Identified Risks</h3>
            {risks
              .sort((a, b) => {
                const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return order[a.severity as keyof typeof order] - order[b.severity as keyof typeof order];
              })
              .map((risk) => {
                const colors = getRiskColor(risk.severity);
                return (
                  <div
                    key={risk.id}
                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colors.icon}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className={`font-medium ${colors.text}`}>{risk.category}</h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded bg-white ${colors.text}`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className={`text-sm ${colors.text} mb-3`}>{risk.description}</p>

                        {/* Confidence Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className={`w-4 h-4 ${colors.icon}`} />
                          <span className="text-xs font-medium">
                            Confidence: {(risk.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Recommendation */}
                        <div className="p-3 bg-white bg-opacity-70 rounded-lg border border-current border-opacity-20">
                          <div className="flex items-start gap-2">
                            <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.icon}`} />
                            <div>
                              <p className="text-xs font-medium mb-1">Recommendation:</p>
                              <p className="text-xs">{risk.recommendation}</p>
                            </div>
                          </div>
                        </div>

                        {/* Related Clause */}
                        {risk.clause && (
                          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                            <p className="text-xs font-medium mb-1">Related Clause:</p>
                            <p className="text-xs">{risk.clause.title}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No risks identified</p>
            <p className="text-sm text-gray-400 mt-1">This appears to be low-risk</p>
          </div>
        )}
      </div>
    </div>
  );
}

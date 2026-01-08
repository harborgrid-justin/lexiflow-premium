/**
 * Contract Analyzer Component
 * Upload and analyze contracts with AI
 */

import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { aiLegalService } from '../services/aiLegalService';
import type { ContractAnalysis, RiskDetection } from '../types';

export interface ContractAnalyzerProps {
  documentId?: string;
  onAnalysisComplete?: (analysis: ContractAnalysis) => void;
  className?: string;
}

export function ContractAnalyzer({ documentId, onAnalysisComplete, className }: ContractAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState(documentId || '');

  const handleAnalyze = async () => {
    if (!selectedDocId) {
      setError('Please provide a document ID');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiLegalService.analyzeContract(selectedDocId);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze contract');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRiskIcon = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Contract Analyzer</h2>
            <p className="text-sm text-purple-100">AI-powered contract review and risk assessment</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Input Section */}
        {!analysis && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document ID
              </label>
              <input
                type="text"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                placeholder="Enter document ID or upload a file"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isAnalyzing}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedDocId}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Analyzing Contract...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Analyze Contract
                </>
              )}
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Contract Type</p>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {analysis.contractType || 'Unknown'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Confidence</p>
                <p className="text-lg font-semibold text-green-900 mt-1">
                  {(analysis.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Clauses Found</p>
                <p className="text-lg font-semibold text-purple-900 mt-1">
                  {analysis.clauses.length}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">Risks Identified</p>
                <p className="text-lg font-semibold text-orange-900 mt-1">
                  {analysis.risks.length}
                </p>
              </div>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-700">{analysis.summary}</p>
              </div>
            )}

            {/* Parties */}
            {analysis.partiesIdentified && analysis.partiesIdentified.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Parties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.partiesIdentified.map((party, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{party.name}</p>
                      <p className="text-xs text-gray-600">{party.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Assessment</h3>
                <div className="space-y-3">
                  {analysis.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-4 rounded-lg border ${getRiskColor(risk.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getRiskIcon(risk.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{risk.category}</h4>
                            <span className="text-xs font-semibold px-2 py-1 rounded">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{risk.description}</p>
                          <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                            <p className="text-xs font-medium mb-1">Recommendation:</p>
                            <p className="text-xs">{risk.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-medium text-blue-900">{rec.type}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{rec.description}</p>
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        Action: {rec.suggestedAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setAnalysis(null);
                setSelectedDocId('');
              }}
              className="w-full px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Analyze Another Contract
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

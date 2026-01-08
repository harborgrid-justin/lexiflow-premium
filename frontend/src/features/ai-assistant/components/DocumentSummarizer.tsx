/**
 * Document Summarizer Component
 * AI-powered document summarization tool
 */

import React, { useState } from 'react';
import { FileText, Sparkles, Clock, BookOpen } from 'lucide-react';
import { aiLegalService } from '../services/aiLegalService';
import type { DocumentSummary } from '../types';

export interface DocumentSummarizerProps {
  documentId?: string;
  onSummaryGenerated?: (summary: DocumentSummary) => void;
  className?: string;
}

export function DocumentSummarizer({ documentId, onSummaryGenerated, className }: DocumentSummarizerProps) {
  const [selectedDocId, setSelectedDocId] = useState(documentId || '');
  const [summaryLength, setSummaryLength] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!selectedDocId) {
      setError('Please provide a document ID');
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const result = await aiLegalService.summarizeDocument({
        documentId: selectedDocId,
        summaryLength,
        includeKeyPoints: true,
        includeQuotes: true,
      });

      setSummary(result);
      onSummaryGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize document');
    } finally {
      setIsSummarizing(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'NEGATIVE':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MIXED':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-violet-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Sparkles className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Document Summarizer</h2>
            <p className="text-sm text-violet-100">AI-powered document analysis and summarization</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!summary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document ID
              </label>
              <input
                type="text"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                placeholder="Enter document ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isSummarizing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['SHORT', 'MEDIUM', 'LONG'] as const).map((length) => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      summaryLength === length
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-violet-300'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={isSummarizing || !selectedDocId}
              className="w-full px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSummarizing ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Summarizing Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Summarize Document
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Document Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-blue-900">{summary.wordCount}</p>
                <p className="text-xs text-blue-600">Words</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-purple-900">{summary.readingTimeMinutes}</p>
                <p className="text-xs text-purple-600">Min Read</p>
              </div>
              <div className={`p-4 rounded-lg border text-center ${getComplexityColor(summary.complexity)}`}>
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <p className="text-lg font-semibold">{summary.complexity}</p>
                <p className="text-xs">Complexity</p>
              </div>
              <div className={`p-4 rounded-lg border text-center ${getSentimentColor(summary.sentiment)}`}>
                <Sparkles className="w-6 h-6 mx-auto mb-2" />
                <p className="text-lg font-semibold">{summary.sentiment}</p>
                <p className="text-xs">Sentiment</p>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.summary}</p>
              </div>
            </div>

            {/* Key Points */}
            {summary.keyPoints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-blue-900">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Quotes */}
            {summary.importantQuotes && summary.importantQuotes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Important Quotes</h3>
                <div className="space-y-3">
                  {summary.importantQuotes.map((quote, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200 border-l-4">
                      <p className="text-sm text-purple-900 italic mb-2">"{quote.text}"</p>
                      <p className="text-xs text-purple-700">{quote.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Topics */}
            {summary.mainTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Main Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.mainTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entities */}
            {summary.entities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Entities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.entities.slice(0, 10).map((entity, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entity.name}</p>
                        <p className="text-xs text-gray-600">{entity.type}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-violet-100 text-violet-700 rounded">
                        ×{entity.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSummary(null);
                setSelectedDocId('');
              }}
              className="w-full px-6 py-3 border border-violet-600 text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
            >
              Summarize Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Copy, Download, Search, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

interface OcrEntity {
  type: string;
  value: string;
  confidence: number;
  position: number;
}

interface OcrResultsProps {
  text: string;
  confidence: number;
  words?: OcrWord[];
  entities?: OcrEntity[];
  metadata?: {
    language: string;
    totalWords: number;
    totalLines: number;
    averageConfidence: number;
  };
  warnings?: string[];
  processingTime: number;
}

/**
 * OCR Results Display Component
 * Features:
 * - Formatted text display
 * - Confidence score visualization
 * - Word-level confidence highlighting
 * - Extracted entities display
 * - Copy and export functionality
 * - Search within results
 * - Quality warnings
 */
export const OCRResults: React.FC<OcrResultsProps> = ({
  text,
  confidence,
  words = [],
  entities = [],
  metadata,
  warnings = [],
  processingTime,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'entities' | 'analysis'>('text');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 90) return 'text-green-600 bg-green-50';
    if (conf >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 90) return 'Excellent';
    if (conf >= 70) return 'Good';
    if (conf >= 50) return 'Fair';
    return 'Poor';
  };

  const highlightSearchTerm = (text: string): React.ReactNode => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const lowConfidenceWords = words.filter((w) => w.confidence < 70);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            OCR Results
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>

            <button
              onClick={downloadText}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${getConfidenceColor(confidence)}`}>
            <p className="text-xs font-medium mb-1">Overall Confidence</p>
            <p className="text-2xl font-bold">{confidence.toFixed(1)}%</p>
            <p className="text-xs mt-1">{getConfidenceLabel(confidence)}</p>
          </div>

          {metadata && (
            <>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Words</p>
                <p className="text-2xl font-bold text-gray-900">{metadata.totalWords}</p>
              </div>

              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Lines</p>
                <p className="text-2xl font-bold text-gray-900">{metadata.totalLines}</p>
              </div>

              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{(processingTime / 1000).toFixed(1)}s</p>
              </div>
            </>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">Quality Warnings</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {(['text', 'entities', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'entities' && entities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {entities.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search in text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Low Confidence Toggle */}
            {lowConfidenceWords.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLowConfidence}
                  onChange={(e) => setShowLowConfidence(e.target.checked)}
                  className="rounded"
                />
                Highlight low confidence words ({lowConfidenceWords.length})
              </label>
            )}

            {/* Text Content */}
            <div className="p-4 bg-gray-50 rounded-lg border font-mono text-sm whitespace-pre-wrap">
              {highlightSearchTerm(text)}
            </div>
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-4">
            {entities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No entities extracted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  entities.reduce((acc, entity) => {
                    if (!acc[entity.type]) acc[entity.type] = [];
                    acc[entity.type].push(entity);
                    return acc;
                  }, {} as Record<string, OcrEntity[]>),
                ).map(([type, items]) => (
                  <div key={type} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
                    </div>
                    <div className="p-4 space-y-2">
                      {items.map((entity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="font-mono text-sm">{entity.value}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(entity.confidence)}`}>
                            {entity.confidence.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Quality Score */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Quality Analysis</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Overall Confidence</span>
                    <span className="text-sm font-medium">{confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        confidence >= 90 ? 'bg-green-500' :
                        confidence >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>

                {metadata && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average Word Confidence</span>
                      <span className="text-sm font-medium">
                        {metadata.averageConfidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${metadata.averageConfidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Word Confidence Distribution */}
            {words.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Confidence Distribution</h3>

                <div className="space-y-2">
                  {[
                    { label: 'High (90-100%)', min: 90, color: 'bg-green-500' },
                    { label: 'Medium (70-89%)', min: 70, color: 'bg-yellow-500' },
                    { label: 'Low (<70%)', min: 0, color: 'bg-red-500' },
                  ].map(({ label, min, color }) => {
                    const count = words.filter(
                      (w) => w.confidence >= min && (min === 90 || w.confidence < min + 20),
                    ).length;
                    const percentage = (count / words.length) * 100;

                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-sm font-medium">
                            {count} words ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommendations
              </h3>

              <ul className="text-sm text-gray-700 space-y-1">
                {confidence < 70 && (
                  <li>• Consider rescanning the document at higher resolution</li>
                )}
                {lowConfidenceWords.length > 20 && (
                  <li>• High number of low-confidence words detected - manual review recommended</li>
                )}
                {metadata && metadata.totalWords < 50 && (
                  <li>• Short document - verify all content was captured</li>
                )}
                {warnings.length === 0 && confidence >= 90 && (
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    OCR quality is excellent - no issues detected
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRResults;

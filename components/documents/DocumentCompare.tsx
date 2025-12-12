import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react';

interface Difference {
  type: 'added' | 'removed' | 'modified';
  lineNumber: number;
  oldValue?: string;
  newValue?: string;
  significance: 'major' | 'minor' | 'formatting';
}

interface ComparisonResult {
  similarity: number;
  differences: Difference[];
  statistics: {
    totalChanges: number;
    additions: number;
    deletions: number;
    modifications: number;
  };
  summary: string;
}

interface DocumentCompareProps {
  documentAId: string;
  documentBId: string;
  documentAName: string;
  documentBName: string;
  onClose?: () => void;
}

/**
 * Side-by-Side Document Comparison Component
 * Features:
 * - Visual diff highlighting
 * - Similarity percentage
 * - Change statistics
 * - Major/minor change classification
 * - Export comparison report
 * - Synchronized scrolling
 */
export const DocumentCompare: React.FC<DocumentCompareProps> = ({
  documentAId,
  documentBId,
  documentAName,
  documentBName,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'major' | 'minor'>('all');
  const [showSideBySide, setShowSideBySide] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [documentAId, documentBId]);

  const loadComparison = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentAId,
          documentBId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare documents');
      }

      const data = await response.json();
      setComparison(data);

    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDifferences = comparison?.differences.filter((diff) => {
    if (filterLevel === 'all') return true;
    return diff.significance === filterLevel;
  }) || [];

  const exportReport = () => {
    if (!comparison) return;

    const report = `
Document Comparison Report
==========================

Documents:
  A: ${documentAName}
  B: ${documentBName}

Similarity: ${(comparison.similarity * 100).toFixed(1)}%

Statistics:
  Total Changes: ${comparison.statistics.totalChanges}
  Additions: ${comparison.statistics.additions}
  Deletions: ${comparison.statistics.deletions}
  Modifications: ${comparison.statistics.modifications}

Summary:
${comparison.summary}

Differences:
${filteredDifferences.map((diff, idx) => `
${idx + 1}. Line ${diff.lineNumber} - ${diff.type.toUpperCase()} (${diff.significance})
   ${diff.oldValue ? `Old: ${diff.oldValue}` : ''}
   ${diff.newValue ? `New: ${diff.newValue}` : ''}
`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.9) return 'text-green-600';
    if (similarity >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Comparing documents...</p>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6" />
            Document Comparison
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Similarity</p>
            <p className={`text-2xl font-bold ${getSimilarityColor(comparison.similarity)}`}>
              {(comparison.similarity * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Total Changes</p>
            <p className="text-2xl font-bold text-gray-900">
              {comparison.statistics.totalChanges}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Additions</p>
            <p className="text-2xl font-bold text-green-600">
              +{comparison.statistics.additions}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Deletions</p>
            <p className="text-2xl font-bold text-red-600">
              -{comparison.statistics.deletions}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">{comparison.summary}</p>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Show:</span>

          {(['all', 'major', 'minor'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && ` (${comparison.differences.filter(d => d.significance === level).length})`}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => setShowSideBySide(!showSideBySide)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            {showSideBySide ? 'Unified View' : 'Side-by-Side'}
          </button>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="flex-1 overflow-auto">
        {showSideBySide ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Document A */}
            <div className="border rounded-lg">
              <div className="bg-gray-50 p-3 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{documentAName}</h3>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {filteredDifferences.map((diff, idx) => (
                  diff.type === 'removed' || diff.type === 'modified' ? (
                    <div
                      key={idx}
                      className={`p-2 rounded ${
                        diff.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' :
                        'bg-yellow-50 border-l-4 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Line {diff.lineNumber}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          diff.significance === 'major' ? 'bg-red-100 text-red-700' :
                          diff.significance === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {diff.significance}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-through">{diff.oldValue}</p>
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            {/* Document B */}
            <div className="border rounded-lg">
              <div className="bg-gray-50 p-3 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{documentBName}</h3>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {filteredDifferences.map((diff, idx) => (
                  diff.type === 'added' || diff.type === 'modified' ? (
                    <div
                      key={idx}
                      className={`p-2 rounded ${
                        diff.type === 'added' ? 'bg-green-50 border-l-4 border-green-500' :
                        'bg-yellow-50 border-l-4 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Line {diff.lineNumber}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          diff.significance === 'major' ? 'bg-red-100 text-red-700' :
                          diff.significance === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {diff.significance}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{diff.newValue}</p>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredDifferences.map((diff, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  diff.type === 'added' ? 'bg-green-50 border-green-500' :
                  diff.type === 'removed' ? 'bg-red-50 border-red-500' :
                  'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Line {diff.lineNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      diff.type === 'added' ? 'bg-green-100 text-green-700' :
                      diff.type === 'removed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {diff.type}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    diff.significance === 'major' ? 'bg-red-100 text-red-700' :
                    diff.significance === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {diff.significance}
                  </span>
                </div>

                {diff.oldValue && (
                  <p className="text-sm text-gray-600 line-through mb-1">
                    - {diff.oldValue}
                  </p>
                )}
                {diff.newValue && (
                  <p className="text-sm text-gray-900 font-medium">
                    + {diff.newValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredDifferences.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No differences found at this level</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCompare;

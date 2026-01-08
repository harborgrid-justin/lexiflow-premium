import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, GitCompare, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { ComparisonResult, DiffOperation } from '../types';
import { format } from 'date-fns';

interface DocumentCompareProps {
  versionId1: string;
  versionId2: string;
  onClose?: () => void;
}

/**
 * DocumentCompare Component
 *
 * Side-by-side document comparison with diff highlighting:
 * - Split view with synchronized scrolling
 * - Line-by-line diff highlighting
 * - Addition/deletion/modification markers
 * - Statistics summary
 * - Export diff report
 */
export const DocumentCompare: React.FC<DocumentCompareProps> = ({
  versionId1,
  versionId2,
  onClose,
}) => {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    loadComparison();
  }, [versionId1, versionId2]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockComparison: ComparisonResult = {
        version1: {
          id: versionId1,
          versionNumber: 1,
          createdAt: new Date('2024-01-05'),
        },
        version2: {
          id: versionId2,
          versionNumber: 2,
          createdAt: new Date('2024-01-10'),
        },
        diff: [
          {
            type: 'equal',
            value: 'IN THE UNITED STATES DISTRICT COURT',
            lineNumber: 1,
          },
          {
            type: 'equal',
            value: 'FOR THE NORTHERN DISTRICT OF CALIFORNIA',
            lineNumber: 2,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 3,
          },
          {
            type: 'delete',
            value: 'JOHN DOE,',
            lineNumber: 4,
          },
          {
            type: 'insert',
            value: 'JOHN DOE and JANE DOE,',
            lineNumber: 4,
          },
          {
            type: 'equal',
            value: '    Plaintiff,',
            lineNumber: 5,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 6,
          },
          {
            type: 'equal',
            value: 'vs.',
            lineNumber: 7,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 8,
          },
          {
            type: 'equal',
            value: 'ACME CORPORATION,',
            lineNumber: 9,
          },
          {
            type: 'equal',
            value: '    Defendant.',
            lineNumber: 10,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 11,
          },
          {
            type: 'delete',
            value: 'Case No. 24-CV-12345',
            lineNumber: 12,
          },
          {
            type: 'insert',
            value: 'Case No. 24-CV-12345-ABC',
            lineNumber: 12,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 13,
          },
          {
            type: 'equal',
            value: 'COMPLAINT FOR DAMAGES',
            lineNumber: 14,
          },
          {
            type: 'equal',
            value: '',
            lineNumber: 15,
          },
          {
            type: 'insert',
            value: 'DEMAND FOR JURY TRIAL',
            lineNumber: 16,
          },
        ],
        statistics: {
          additions: 2,
          deletions: 2,
          modifications: 2,
          unchanged: 13,
          totalLines1: 15,
          totalLines2: 16,
          similarity: 87,
        },
        metadata: {
          comparedAt: new Date(),
          algorithm: 'line',
        },
      };

      setComparison(mockComparison);
    } catch (error) {
      console.error('Failed to load comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiffLineClass = (type: string) => {
    switch (type) {
      case 'insert':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'delete':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'replace':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      default:
        return '';
    }
  };

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'delete':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'replace':
        return <ArrowLeftRight className="w-4 h-4 text-yellow-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderSplitView = () => {
    if (!comparison) return null;

    // Split diffs into left and right sides
    const leftLines: Array<{ line: DiffOperation | null; lineNum: number }> = [];
    const rightLines: Array<{ line: DiffOperation | null; lineNum: number }> = [];

    let leftLineNum = 1;
    let rightLineNum = 1;

    comparison.diff.forEach((diff) => {
      if (diff.type === 'delete') {
        leftLines.push({ line: diff, lineNum: leftLineNum++ });
        rightLines.push({ line: null, lineNum: rightLineNum });
      } else if (diff.type === 'insert') {
        leftLines.push({ line: null, lineNum: leftLineNum });
        rightLines.push({ line: diff, lineNum: rightLineNum++ });
      } else {
        leftLines.push({ line: diff, lineNum: leftLineNum++ });
        rightLines.push({ line: diff, lineNum: rightLineNum++ });
      }
    });

    return (
      <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
        {/* Left side - Version 1 */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold">
              Version {comparison.version1.versionNumber}
            </div>
            <div className="text-xs text-gray-500">
              {format(comparison.version1.createdAt, 'MMM d, yyyy')}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-sm">
            {leftLines.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.line ? getDiffLineClass(item.line.type) : 'bg-gray-50 dark:bg-gray-800/50'}`}
              >
                <div className="w-12 flex-shrink-0 text-right pr-2 py-1 text-xs text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {item.line ? item.lineNum : ''}
                </div>
                <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-all">
                  {item.line ? item.line.value || ' ' : ' '}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Version 2 */}
        <div className="flex flex-col">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold">
              Version {comparison.version2.versionNumber}
            </div>
            <div className="text-xs text-gray-500">
              {format(comparison.version2.createdAt, 'MMM d, yyyy')}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-sm">
            {rightLines.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.line ? getDiffLineClass(item.line.type) : 'bg-gray-50 dark:bg-gray-800/50'}`}
              >
                <div className="w-12 flex-shrink-0 text-right pr-2 py-1 text-xs text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  {item.line ? item.lineNum : ''}
                </div>
                <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-all">
                  {item.line ? item.line.value || ' ' : ' '}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUnifiedView = () => {
    if (!comparison) return null;

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold">
            Comparing Version {comparison.version1.versionNumber} → Version{' '}
            {comparison.version2.versionNumber}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-sm">
          {comparison.diff.map((diff, idx) => (
            <div
              key={idx}
              className={`flex ${getDiffLineClass(diff.type)}`}
            >
              <div className="w-12 flex-shrink-0 px-2 py-1 text-center">
                {getDiffIcon(diff.type)}
              </div>
              <div className="w-12 flex-shrink-0 text-right pr-2 py-1 text-xs text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {diff.lineNumber}
              </div>
              <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-all">
                {diff.value || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <GitCompare className="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header with stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Document Comparison</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : ''
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'unified'
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : ''
                }`}
              >
                Unified
              </button>
            </div>

            <button
              onClick={() => {
                /* Export diff */
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              +{comparison.statistics.additions}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Additions
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              -{comparison.statistics.deletions}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Deletions
            </div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {comparison.statistics.modifications}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Changes
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {comparison.statistics.similarity}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Similarity
            </div>
          </div>
        </div>
      </div>

      {/* Comparison view */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
      </div>
    </div>
  );
};

export default DocumentCompare;

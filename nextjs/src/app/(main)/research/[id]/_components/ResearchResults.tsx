'use client';

/**
 * Research Results Component
 * Displays search results with citation details
 *
 * @module research/[id]/_components/ResearchResults
 */

import { useState } from 'react';
import {
  Scale,
  FileText,
  BookOpen,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ResearchSearchResult, CitationStatus, ShepardsSignal } from '@/types/research';
import { createBookmark } from '../../actions';

interface ResearchResultsProps {
  results: ResearchSearchResult[];
}

export function ResearchResults({ results }: ResearchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0) {
    return (
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center py-8">
          <Scale className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
            No results
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This session has no saved search results
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Search Results ({results.length})
        </h2>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {results.map((result) => (
          <ResultItem
            key={result.id}
            result={result}
            isExpanded={expandedId === result.id}
            onToggle={() =>
              setExpandedId(expandedId === result.id ? null : result.id)
            }
          />
        ))}
      </div>
    </section>
  );
}

// Result Item Component
function ResultItem({
  result,
  isExpanded,
  onToggle,
}: {
  result: ResearchSearchResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isBookmarking, setIsBookmarking] = useState(false);

  const Icon = getItemTypeIcon(result.itemType);
  const signalInfo = getSignalInfo(result.shepardsSignal, result.citationStatus);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarking(true);

    await createBookmark({
      userId: 'current-user' as any,
      itemType: result.itemType,
      externalId: result.id,
      title: result.title,
      citation: result.citation,
      source: result.source,
      sourceUrl: result.url,
      citationStatus: result.citationStatus,
    });

    setIsBookmarking(false);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Title */}
              <h3 className="font-medium text-slate-900 dark:text-white">
                {result.title}
              </h3>

              {/* Citation */}
              {result.citation && (
                <p className="mt-1 text-sm font-mono text-blue-600 dark:text-blue-400">
                  {result.citation}
                </p>
              )}

              {/* Meta info */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {result.court && <span>{result.court}</span>}
                {result.year && <span>{result.year}</span>}
                {result.jurisdiction && <span>{result.jurisdiction}</span>}
                <span className="capitalize">{result.source}</span>
              </div>
            </div>

            {/* Signal & Actions */}
            <div className="flex flex-col items-end gap-2">
              {signalInfo && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${signalInfo.bgColor} ${signalInfo.textColor}`}
                >
                  <signalInfo.icon className="h-3.5 w-3.5" />
                  {signalInfo.label}
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarking}
                  className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Bookmark"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Snippet */}
          {result.snippet && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {result.snippet}
            </p>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={onToggle}
            className="mt-3 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show more
              </>
            )}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {/* Description */}
              {result.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {result.description}
                  </p>
                </div>
              )}

              {/* Headnotes */}
              {result.headnotes && result.headnotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Headnotes
                  </h4>
                  <ul className="space-y-2">
                    {result.headnotes.map((headnote, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700 dark:text-slate-300 pl-4 border-l-2 border-blue-300 dark:border-blue-600"
                      >
                        {headnote}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Topics */}
              {result.topics && result.topics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevance Explanation */}
              {result.relevanceExplanation && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Why this result?
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {result.relevanceExplanation}
                  </p>
                </div>
              )}

              {/* Availability badges */}
              <div className="flex items-center gap-3 pt-2">
                {result.hasFullText && (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Full text available
                  </span>
                )}
                {result.hasPdf && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <FileText className="h-3.5 w-3.5" />
                    PDF available
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Functions

function getItemTypeIcon(itemType: string): React.ElementType {
  switch (itemType) {
    case 'case_law':
      return Scale;
    case 'statute':
    case 'regulation':
      return FileText;
    case 'secondary_source':
    case 'treatise':
    case 'law_review':
    case 'practice_guide':
      return BookOpen;
    default:
      return FileText;
  }
}

function getSignalInfo(
  signal?: ShepardsSignal,
  status?: CitationStatus
): {
  icon: React.ElementType;
  label: string;
  bgColor: string;
  textColor: string;
} | null {
  if (signal === 'negative' || status === 'overruled') {
    return {
      icon: XCircle,
      label: 'Negative',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
    };
  }
  if (signal === 'caution' || status === 'warning' || status === 'questioned') {
    return {
      icon: AlertTriangle,
      label: 'Caution',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-700 dark:text-amber-400',
    };
  }
  if (signal === 'positive' || status === 'valid') {
    return {
      icon: CheckCircle2,
      label: 'Valid',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
    };
  }
  return null;
}

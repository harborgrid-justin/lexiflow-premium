'use client';

/**
 * Shepardizing Tool Component
 * Citation analysis with appellate history and treatment tracking
 *
 * Features:
 * - Citation input with Enter key support
 * - Real-time Shepardizing with loading state
 * - Appellate History display with treatment icons
 * - Citing Treatment analysis with blockquotes
 * - Treatment badges: Followed (green), Distinguished/Questioned (amber), Criticized (red)
 * - Dual-panel layout for History and Treatment
 *
 * @module research/_components/ShepardizingTool
 */

import React, { useState, useCallback, useTransition } from 'react';
import {
  Scale,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Gavel,
} from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { checkCitation } from '../actions';
import type { CitationCheckResult, ShepardsSignal } from '@/types/research';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TreatmentType =
  | 'followed'
  | 'affirmed'
  | 'cited'
  | 'explained'
  | 'overruled'
  | 'distinguished'
  | 'questioned'
  | 'criticized'
  | 'limited';

interface AppellateHistoryItem {
  action: string;
  citingCase: string;
  citingCitation?: string;
  year?: number;
  court?: string;
}

interface TreatmentItem {
  citingCase: string;
  citation: string;
  treatment: TreatmentType;
  quote?: string;
  year: number;
  court: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Maps CitationCheckResult to internal appellate history format
 */
function mapToAppellateHistory(result: CitationCheckResult): AppellateHistoryItem[] {
  const history: AppellateHistoryItem[] = [];

  // Add positive treatments that represent appellate history (affirmed, etc.)
  if (result.positiveTreatment) {
    result.positiveTreatment
      .filter((t) => t.type === 'affirmed')
      .forEach((t) => {
        history.push({
          action: 'Affirmed',
          citingCase: t.title,
          citingCitation: t.citation,
          year: t.year,
          court: t.court,
        });
      });
  }

  // Add negative treatments that represent appellate history (overruled, reversed)
  if (result.negativeTreatment) {
    result.negativeTreatment
      .filter((t) => t.type === 'overruled')
      .forEach((t) => {
        history.push({
          action: 'Overruled',
          citingCase: t.title,
          citingCitation: t.citation,
          year: t.year,
          court: t.court,
        });
      });
  }

  return history;
}

/**
 * Maps CitationCheckResult to internal treatment format
 */
function mapToTreatmentItems(result: CitationCheckResult): TreatmentItem[] {
  const items: TreatmentItem[] = [];

  // Map positive treatments
  if (result.positiveTreatment) {
    result.positiveTreatment.forEach((t) => {
      items.push({
        citingCase: t.title,
        citation: t.citation,
        treatment: t.type,
        year: t.year,
        court: t.court,
      });
    });
  }

  // Map negative treatments
  if (result.negativeTreatment) {
    result.negativeTreatment.forEach((t) => {
      items.push({
        citingCase: t.title,
        citation: t.citation,
        treatment: t.type,
        quote: t.description,
        year: t.year,
        court: t.court,
      });
    });
  }

  return items;
}

/**
 * Gets the signal description for display
 */
function getSignalDescription(signal?: ShepardsSignal): string {
  switch (signal) {
    case 'positive':
      return 'This case has positive treatment - it has been followed or affirmed.';
    case 'negative':
      return 'Warning: This case has negative treatment - it may have been overruled or criticized.';
    case 'caution':
      return 'Caution: This case has been questioned or distinguished by other courts.';
    case 'cited':
      return 'This case has been cited by other cases without significant analysis.';
    case 'neutral':
    default:
      return 'No significant positive or negative treatment found.';
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Treatment Badge Component
 * Displays colored badges based on treatment type
 */
function TreatmentBadge({ treatment }: { treatment: TreatmentType }) {
  const getVariant = (): 'success' | 'warning' | 'error' | 'neutral' => {
    switch (treatment) {
      case 'followed':
      case 'affirmed':
        return 'success';
      case 'distinguished':
      case 'questioned':
      case 'limited':
        return 'warning';
      case 'criticized':
      case 'overruled':
        return 'error';
      case 'cited':
      case 'explained':
      default:
        return 'neutral';
    }
  };

  const formatLabel = (t: TreatmentType): string => {
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  return <Badge variant={getVariant()}>{formatLabel(treatment)}</Badge>;
}

/**
 * History Icon Component
 * Returns appropriate icon based on appellate action
 */
function HistoryIcon({ action }: { action: string }) {
  const lowerAction = action.toLowerCase();

  if (lowerAction.includes('affirm')) {
    return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />;
  }
  if (lowerAction.includes('revers') || lowerAction.includes('vacat') || lowerAction.includes('overrul')) {
    return <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
  }
  if (lowerAction.includes('appeal') || lowerAction.includes('question')) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />;
  }
  return <HelpCircle className="h-4 w-4 text-slate-400" aria-hidden="true" />;
}

/**
 * Signal Indicator Component
 * Displays the Shepard's signal with appropriate styling
 */
function SignalIndicator({ signal }: { signal?: ShepardsSignal }) {
  const getSignalStyle = (): string => {
    switch (signal) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'caution':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cited':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getSignalIcon = () => {
    switch (signal) {
      case 'positive':
        return <CheckCircle className="h-4 w-4" />;
      case 'negative':
        return <XCircle className="h-4 w-4" />;
      case 'caution':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getSignalStyle()}`}
    >
      {getSignalIcon()}
      {signal ? signal.charAt(0).toUpperCase() + signal.slice(1) : 'Unknown'}
    </span>
  );
}

/**
 * Card Component for consistent panel styling
 */
function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ShepardizingTool() {
  const [citation, setCitation] = useState('');
  const [result, setResult] = useState<CitationCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(() => {
    if (!citation.trim()) return;

    setError(null);

    startTransition(async () => {
      const response = await checkCitation(citation.trim(), {
        depth: 'comprehensive',
        includeNegativeTreatment: true,
        includeCitingReferences: true,
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to analyze citation');
        setResult(null);
      }
    });
  }, [citation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const appellateHistory = result ? mapToAppellateHistory(result) : [];
  const treatmentItems = result ? mapToTreatmentItems(result) : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Citation Input Section */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Citation Analysis
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Check appellate history and treatment of a case citation.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 410 U.S. 113"
              className="flex-1 md:w-64 p-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm font-mono bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Citation to analyze"
            />
            <Button
              onClick={handleSearch}
              isLoading={isPending}
              disabled={!citation.trim() || isPending}
            >
              {isPending ? 'Analyzing...' : 'Shepardize'}
            </Button>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isPending && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Loading analysis" />
        </div>
      )}

      {/* Error State */}
      {error && !isPending && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !isPending && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card title={result.title || 'Citation Analysis'} icon={Gavel}>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {result.citation}
                </p>
                <SignalIndicator signal={result.signal} />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {getSignalDescription(result.signal)}
              </p>

              {result.court && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Court:</span>
                  <span>{result.court}</span>
                  {result.year && (
                    <>
                      <span className="mx-1">|</span>
                      <span className="font-medium">Year:</span>
                      <span>{result.year}</span>
                    </>
                  )}
                </div>
              )}

              {result.citingReferencesCount !== undefined && result.citingReferencesCount > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cited by {result.citingReferencesCount} case
                  {result.citingReferencesCount !== 1 ? 's' : ''}
                </p>
              )}

              {!result.bluebookValid && result.suggestedFormat && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-medium">Suggested Bluebook format:</span>{' '}
                    <span className="font-mono">{result.suggestedFormat}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Dual Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appellate History Panel */}
            <Card title="Appellate History" icon={BookOpen}>
              <div className="space-y-3">
                {appellateHistory.length > 0 ? (
                  appellateHistory.map((h, i) => (
                    <div
                      key={`history-${h.citingCase}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                    >
                      <HistoryIcon action={h.action} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {h.action}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {h.citingCase}
                          {h.citingCitation && ` (${h.citingCitation})`}
                        </p>
                        {h.court && h.year && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                            {h.court}, {h.year}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center italic text-slate-500 dark:text-slate-400 py-4">
                    No appellate history found.
                  </p>
                )}
              </div>
            </Card>

            {/* Citing Treatment Panel */}
            <Card title="Citing Treatment" icon={Gavel}>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {treatmentItems.length > 0 ? (
                  treatmentItems.map((t, i) => (
                    <div
                      key={`treatment-${t.citingCase}-${i}`}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {t.citingCase}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t.citation} ({t.court}, {t.year})
                          </p>
                        </div>
                        <TreatmentBadge treatment={t.treatment} />
                      </div>
                      {t.quote && (
                        <blockquote className="mt-3 border-l-4 border-slate-300 dark:border-slate-600 pl-4 text-sm italic text-slate-600 dark:text-slate-400">
                          &ldquo;{t.quote}&rdquo;
                        </blockquote>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center italic text-slate-500 dark:text-slate-400 py-4">
                    No citing treatments found.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShepardizingTool;

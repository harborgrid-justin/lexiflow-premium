import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';
import { legalResearchApi, CaseLaw, CitationAnalysis } from '../legalResearchApi';

interface CaseLawViewerProps {
  caseId: string;
  onClose?: () => void;
}

/**
 * CaseLawViewer Component
 * Displays detailed case law information with citation analysis
 */
export const CaseLawViewer: React.FC<CaseLawViewerProps> = ({ caseId, onClose }) => {
  const [caseLaw, setCaseLaw] = useState<CaseLaw | null>(null);
  const [citationAnalysis, setCitationAnalysis] = useState<CitationAnalysis | null>(null);
  const [similarCases, setSimilarCases] = useState<CaseLaw[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'similar'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [caseData, analysis, similar] = await Promise.all([
        legalResearchApi.getCaseLawById(caseId),
        legalResearchApi.getCitationAnalysis(caseId),
        legalResearchApi.getSimilarCases(caseId, 5),
      ]);

      setCaseLaw(caseData);
      setCitationAnalysis(analysis);
      setSimilarCases(similar);
    } catch (err) {
      setError('Failed to load case data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTreatmentSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'red_flag':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Red Flag',
          description: 'Negative treatment',
        };
      case 'yellow_flag':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Yellow Flag',
          description: 'Caution advised',
        };
      case 'blue_a':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          label: 'Blue A',
          description: 'Affirmed',
        };
      case 'green_c':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Green C',
          description: 'Cited favorably',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: 'Neutral',
          description: 'Standard citation',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case law...</p>
        </div>
      </div>
    );
  }

  if (error || !caseLaw) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Case not found'}</p>
      </div>
    );
  }

  const signalDisplay = citationAnalysis
    ? getTreatmentSignalDisplay(citationAnalysis.treatmentSignal)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{caseLaw.title}</h1>
            </div>
            <p className="text-lg text-gray-600 font-mono">{caseLaw.citation}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Case Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Court</p>
              <p className="font-medium">{caseLaw.court}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(caseLaw.decisionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Author</p>
              <p className="font-medium">{caseLaw.opinionAuthor || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Citations</p>
              <p className="font-medium">{caseLaw.citationCount}</p>
            </div>
          </div>
        </div>

        {/* Citation Treatment Signal */}
        {signalDisplay && citationAnalysis && (
          <div className={`mt-4 p-4 rounded-lg border ${signalDisplay.bg} ${signalDisplay.border}`}>
            <div className="flex items-center gap-3">
              <div className={signalDisplay.color}>{signalDisplay.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${signalDisplay.color}`}>
                    {signalDisplay.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    - {signalDisplay.description}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {citationAnalysis.isStillGoodLaw
                    ? 'This case is still good law'
                    : 'This case may have negative treatment'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'analysis'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Citation Analysis
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'similar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Similar Cases ({similarCases.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary */}
            {caseLaw.summary && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{caseLaw.summary}</p>
              </div>
            )}

            {/* Headnotes */}
            {caseLaw.headnotes && caseLaw.headnotes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Headnotes</h3>
                <ul className="space-y-2">
                  {caseLaw.headnotes.map((headnote, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                      <span className="text-gray-700">{headnote}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics */}
            {caseLaw.topics && caseLaw.topics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Legal Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {caseLaw.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Text */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Full Opinion
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                  {caseLaw.fullText}
                </pre>
              </div>
            </div>

            {/* External Link */}
            {caseLaw.sourceUrl && (
              <a
                href={caseLaw.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                View on External Source
              </a>
            )}
          </div>
        )}

        {activeTab === 'analysis' && citationAnalysis && (
          <div className="space-y-6">
            {/* Citation Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Citations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {citationAnalysis.totalCitations}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Positive</p>
                <p className="text-2xl font-bold text-green-900">
                  {citationAnalysis.positiveCitations}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Negative</p>
                <p className="text-2xl font-bold text-red-900">
                  {citationAnalysis.negativeCitations}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">Neutral</p>
                <p className="text-2xl font-bold text-blue-900">
                  {citationAnalysis.neutralCitations}
                </p>
              </div>
            </div>

            {/* Citation History Chart */}
            {citationAnalysis.citationHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Citation History</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-48 flex items-end gap-2">
                    {citationAnalysis.citationHistory.map((item) => {
                      const maxCount = Math.max(
                        ...citationAnalysis.citationHistory.map((i) => i.count)
                      );
                      const height = (item.count / maxCount) * 100;

                      return (
                        <div key={item.year} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${height}%` }}
                            title={`${item.count} citations`}
                          />
                          <span className="text-xs text-gray-600 mt-2">{item.year}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Critical Treatments */}
            {citationAnalysis.criticalTreatments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">
                  Critical Treatments
                </h3>
                <div className="space-y-2">
                  {citationAnalysis.criticalTreatments.slice(0, 5).map((link) => (
                    <div
                      key={link.id}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {link.sourceCase?.title || 'Unknown Case'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Treatment: <span className="font-semibold">{link.treatment}</span>
                          </p>
                          {link.contextSnippet && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{link.contextSnippet}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(link.citationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'similar' && (
          <div className="space-y-4">
            {similarCases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No similar cases found</p>
            ) : (
              similarCases.map((similar) => (
                <div
                  key={similar.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{similar.title}</h4>
                  <p className="text-sm text-gray-600 font-mono mb-2">{similar.citation}</p>
                  {similar.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2">{similar.summary}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{similar.court}</span>
                    <span>{new Date(similar.decisionDate).toLocaleDateString()}</span>
                    <span>{similar.citationCount} citations</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  ExternalLink,
  Bookmark,
  Share2,
  Clock,
} from 'lucide-react';
import { legalResearchApi, Statute } from '../legalResearchApi';

interface StatuteViewerProps {
  statuteId: string;
  onClose?: () => void;
}

/**
 * StatuteViewer Component
 * Displays detailed statute information with cross-references
 */
export const StatuteViewer: React.FC<StatuteViewerProps> = ({ statuteId, onClose }) => {
  const [statute, setStatute] = useState<Statute | null>(null);
  const [relatedStatutes, setRelatedStatutes] = useState<Statute[]>([]);
  const [citationInfo, setCitationInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'related' | 'history'>('text');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatuteData();
  }, [statuteId]);

  const loadStatuteData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statuteData, related, citations] = await Promise.all([
        legalResearchApi.getStatuteById(statuteId),
        legalResearchApi.getRelatedStatutes(statuteId, 5),
        legalResearchApi.getStatuteCitationInfo(statuteId),
      ]);

      setStatute(statuteData);
      setRelatedStatutes(related);
      setCitationInfo(citations);
    } catch (err) {
      setError('Failed to load statute data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statute...</p>
        </div>
      </div>
    );
  }

  if (error || !statute) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Statute not found'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{statute.title}</h1>
            </div>
            <p className="text-lg text-gray-600 font-mono">
              {statute.code} § {statute.section}
            </p>
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

        {/* Statute Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Jurisdiction</p>
              <p className="font-medium">{statute.jurisdiction}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{statute.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Effective Date</p>
              <p className="font-medium">
                {statute.effectiveDate
                  ? new Date(statute.effectiveDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Last Amended</p>
              <p className="font-medium">
                {statute.lastAmended
                  ? new Date(statute.lastAmended).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          {statute.isActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active Statute</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Repealed/Inactive</span>
              {statute.sunsetDate && (
                <span className="text-sm text-red-600">
                  (Sunset: {new Date(statute.sunsetDate).toLocaleDateString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Citation Count */}
        {citationInfo && (
          <div className="mt-4 flex gap-4 text-sm">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold">
                {citationInfo.citationCount}
              </span>
              <span className="text-blue-600 ml-1">Total Citations</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-700 font-semibold">
                {citationInfo.recentCitations}
              </span>
              <span className="text-green-600 ml-1">Recent Citations</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'text'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Statute Text
          </button>
          <button
            onClick={() => setActiveTab('related')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'related'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Related Statutes ({relatedStatutes.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Legislative History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'text' && (
          <div className="space-y-6">
            {/* Chapter and Subchapter */}
            {(statute.chapter || statute.subchapter) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {statute.chapter && (
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Chapter:</span> {statute.chapter}
                  </p>
                )}
                {statute.subchapter && (
                  <p className="text-sm text-blue-900 mt-1">
                    <span className="font-semibold">Subchapter:</span> {statute.subchapter}
                  </p>
                )}
              </div>
            )}

            {/* Statute Text */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Statute Text</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                  {statute.text}
                </pre>
              </div>
            </div>

            {/* Topics */}
            {statute.topics && statute.topics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Legal Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {statute.topics.map((topic, idx) => (
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

            {/* Cross References */}
            {statute.crossReferences && statute.crossReferences.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Cross References
                </h3>
                <ul className="space-y-2">
                  {statute.crossReferences.map((ref, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="font-mono">{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {statute.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes & Annotations</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{statute.notes}</p>
                </div>
              </div>
            )}

            {/* External Link */}
            {statute.sourceUrl && (
              <a
                href={statute.sourceUrl}
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

        {activeTab === 'related' && (
          <div className="space-y-4">
            {relatedStatutes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No related statutes found</p>
            ) : (
              relatedStatutes.map((related) => (
                <div
                  key={related.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{related.title}</h4>
                  <p className="text-sm text-gray-600 font-mono mb-2">
                    {related.code} § {related.section}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {related.text.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{related.jurisdiction}</span>
                    <span>{related.type}</span>
                    {related.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Cross-Referenced Statutes */}
            {citationInfo?.crossReferences && citationInfo.crossReferences.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Cross-Referenced Statutes</h3>
                <div className="space-y-2">
                  {citationInfo.crossReferences.map((ref: Statute) => (
                    <div
                      key={ref.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                    >
                      <p className="font-medium text-gray-900">{ref.title}</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {ref.code} § {ref.section}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Legislative History */}
            {statute.legislativeHistory && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Legislative History</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {statute.legislativeHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-4">
                {statute.effectiveDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-gray-900">Effective Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(statute.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {statute.lastAmended && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-gray-900">Last Amended</p>
                      <p className="text-sm text-gray-600">
                        {new Date(statute.lastAmended).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {statute.sunsetDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                    <div>
                      <p className="font-medium text-gray-900">Sunset Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(statute.sunsetDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* State Specific */}
            {statute.state && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Jurisdiction Details</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">State:</span> {statute.state}
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    <span className="font-semibold">Jurisdiction:</span> {statute.jurisdiction}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

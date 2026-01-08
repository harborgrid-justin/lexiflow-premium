import React, { useState } from 'react';
import {
  Search,
  History,
  Bookmark,
  TrendingUp,
  FileText,
  Gavel,
  BookOpen,
  Network,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { ResearchSearchBar } from './ResearchSearchBar';
import { CaseLawViewer } from './CaseLawViewer';
import { StatuteViewer } from './StatuteViewer';
import { CitationGraph } from './CitationGraph';
import { legalResearchApi, SearchResult } from '../legalResearchApi';

type ViewMode = 'search' | 'case' | 'statute' | 'graph' | 'history';

/**
 * ResearchWorkspace Component
 * Main workspace for conducting legal research
 */
export const ResearchWorkspace: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchResults, setSearchResults] = useState<{
    caseLaw: SearchResult[];
    statutes: SearchResult[];
    totalResults: number;
  } | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedStatuteId, setSelectedStatuteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultLayout, setResultLayout] = useState<'grid' | 'list'>('list');
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [bookmarkedQueries, setBookmarkedQueries] = useState<any[]>([]);

  const handleSearch = (results: any) => {
    setSearchResults(results);
    setViewMode('search');
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'case_law') {
      setSelectedCaseId(result.id);
      setViewMode('case');
    } else {
      setSelectedStatuteId(result.id);
      setViewMode('statute');
    }
  };

  const handleViewGraph = (caseId: string) => {
    setSelectedCaseId(caseId);
    setViewMode('graph');
  };

  const loadHistory = async () => {
    try {
      const history = await legalResearchApi.getResearchHistory(20);
      setRecentSearches(history.queries);
      setViewMode('history');
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await legalResearchApi.getBookmarkedQueries(50);
      setBookmarkedQueries(bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const renderSearchResults = () => {
    if (!searchResults || searchResults.totalResults === 0) {
      return (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No results found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search terms or filters
          </p>
        </div>
      );
    }

    const allResults = [...searchResults.caseLaw, ...searchResults.statutes];

    return (
      <div>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {searchResults.totalResults} Results Found
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {searchResults.caseLaw.length} cases, {searchResults.statutes.length} statutes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setResultLayout('list')}
              className={`p-2 rounded ${
                resultLayout === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setResultLayout('grid')}
              className={`p-2 rounded ${
                resultLayout === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results List/Grid */}
        <div
          className={
            resultLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {allResults.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    result.type === 'case_law' ? 'bg-blue-50' : 'bg-green-50'
                  }`}
                >
                  {result.type === 'case_law' ? (
                    <Gavel className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {result.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        result.type === 'case_law'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {result.type === 'case_law' ? 'Case' : 'Statute'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono mb-2">{result.citation}</p>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {result.snippet}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {result.metadata?.court && <span>{result.metadata.court}</span>}
                    {result.metadata?.jurisdiction && (
                      <span>{result.metadata.jurisdiction}</span>
                    )}
                    {result.metadata?.decisionDate && (
                      <span>
                        {new Date(result.metadata.decisionDate as string).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHistoryView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Research History</h2>
          <button
            onClick={() => setViewMode('search')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Back to Search
          </button>
        </div>

        {recentSearches.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent searches</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((query) => (
              <div
                key={query.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{query.query}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {query.resultCount} results • {query.queryType}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(query.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {query.isBookmarked && (
                    <Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                {query.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{query.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Gavel className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LexiFlow Research</h1>
            </div>
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={loadHistory}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-5 h-5" />
                History
              </button>
              <button
                onClick={loadBookmarks}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bookmark className="w-5 h-5" />
                Bookmarks
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'search' && (
          <div className="space-y-6">
            <ResearchSearchBar onSearch={handleSearch} onLoading={setIsLoading} />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Searching legal databases...</p>
                </div>
              </div>
            ) : (
              searchResults && renderSearchResults()
            )}

            {!searchResults && !isLoading && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="max-w-3xl mx-auto text-center">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Start Your Legal Research
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Search case law, statutes, and perform Shepard's-style citation analysis
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <Gavel className="w-8 h-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold mb-1">Case Law Search</h3>
                      <p className="text-sm text-gray-600">
                        Search federal and state cases with advanced filters
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <BookOpen className="w-8 h-8 text-green-600 mb-2" />
                      <h3 className="font-semibold mb-1">Statute Research</h3>
                      <p className="text-sm text-gray-600">
                        Find statutes, regulations, and cross-references
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <Network className="w-8 h-8 text-purple-600 mb-2" />
                      <h3 className="font-semibold mb-1">Citation Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Shepard's-style treatment analysis and citation graphs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'case' && selectedCaseId && (
          <div>
            <button
              onClick={() => setViewMode('search')}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Results
            </button>
            <CaseLawViewer
              caseId={selectedCaseId}
              onClose={() => setViewMode('search')}
            />
            <div className="mt-6">
              <button
                onClick={() => handleViewGraph(selectedCaseId)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Network className="w-5 h-5" />
                View Citation Network
              </button>
            </div>
          </div>
        )}

        {viewMode === 'statute' && selectedStatuteId && (
          <div>
            <button
              onClick={() => setViewMode('search')}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Results
            </button>
            <StatuteViewer
              statuteId={selectedStatuteId}
              onClose={() => setViewMode('search')}
            />
          </div>
        )}

        {viewMode === 'graph' && selectedCaseId && (
          <div>
            <button
              onClick={() => setViewMode('case')}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Case
            </button>
            <CitationGraph
              caseId={selectedCaseId}
              onCaseClick={(caseId) => {
                setSelectedCaseId(caseId);
                setViewMode('case');
              }}
            />
          </div>
        )}

        {viewMode === 'history' && renderHistoryView()}
      </main>
    </div>
  );
};

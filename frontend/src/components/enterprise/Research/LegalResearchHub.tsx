/**
 * @module enterprise/Research/LegalResearchHub
 * @category Enterprise Research
 * @description AI-powered legal research hub with case law, statutes, and regulations search
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Scale,
  FileText,
  BookmarkPlus,
  History,
  Sparkles,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Highlighter,
  MessageSquare,
  Share2,
  Download,
  Star,
  Clock,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ResearchSession {
  id: string;
  title: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  saved: boolean;
}

export interface ResearchResult {
  id: string;
  title: string;
  citation: string;
  court?: string;
  date?: string;
  type: 'case' | 'statute' | 'regulation' | 'article';
  snippet: string;
  relevanceScore: number;
  highlighted?: string[];
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'red';
  note?: string;
  timestamp: Date;
}

export interface SearchFilters {
  jurisdiction?: string[];
  dateRange?: { from: Date; to: Date };
  court?: string[];
  documentType?: string[];
  relevanceThreshold?: number;
}

export interface LegalResearchHubProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  onSaveResult?: (result: ResearchResult) => void;
  onCreateAnnotation?: (resultId: string, annotation: Annotation) => void;
  onExport?: (results: ResearchResult[]) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const LegalResearchHub: React.FC<LegalResearchHubProps> = ({
  onSearch,
  onSaveResult,
  onCreateAnnotation,
  onExport,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'sessions' | 'saved'>('search');
  const [showFilters, setShowFilters] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for demonstration
  const [sessions] = useState<ResearchSession[]>([
    {
      id: '1',
      title: 'Contract Law Research',
      query: 'breach of contract damages',
      timestamp: new Date('2024-01-15'),
      resultsCount: 42,
      saved: true,
    },
    {
      id: '2',
      title: 'Employment Discrimination',
      query: 'Title VII discrimination workplace',
      timestamp: new Date('2024-01-14'),
      resultsCount: 28,
      saved: false,
    },
  ]);

  const [results] = useState<ResearchResult[]>([
    {
      id: '1',
      title: 'Hadley v. Baxendale',
      citation: '9 Ex. 341, 156 Eng. Rep. 145 (1854)',
      court: 'Court of Exchequer',
      date: '1854',
      type: 'case',
      snippet: 'The damages which the other party ought to receive in respect of such breach of contract should be such as may fairly and reasonably be considered either arising naturally...',
      relevanceScore: 0.95,
      highlighted: ['breach of contract', 'damages'],
    },
    {
      id: '2',
      title: 'Uniform Commercial Code § 2-714',
      citation: 'UCC § 2-714',
      type: 'statute',
      snippet: 'Where the buyer has accepted goods and given notification (subsection (3) of Section 2-607) he may recover as damages for any non-conformity of tender the loss resulting...',
      relevanceScore: 0.88,
      highlighted: ['damages', 'buyer'],
    },
  ]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      onSearch?.(searchQuery, filters);
      setIsSearching(false);
    }, 1000);
  }, [searchQuery, filters, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const getResultIcon = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case':
        return <Scale className="h-5 w-5" />;
      case 'statute':
        return <BookOpen className="h-5 w-5" />;
      case 'regulation':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: ResearchResult['type']) => {
    switch (type) {
      case 'case':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'statute':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'regulation':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Legal Research Hub
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              AI-powered research across case law, statutes, and regulations
            </p>
          </div>
          <button
            onClick={() => setShowAIAssist(!showAIAssist)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Research Assistant
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Sessions ({sessions.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              Saved
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Search Panel */}
        <div className={`flex-1 overflow-y-auto ${selectedResult ? 'hidden lg:block' : ''}`}>
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'search' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search case law, statutes, regulations..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-32 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                          title="Filters"
                        >
                          <SlidersHorizontal className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Jurisdiction
                            </label>
                            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                              <option>All Jurisdictions</option>
                              <option>Federal</option>
                              <option>State</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Document Type
                            </label>
                            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                              <option>All Types</option>
                              <option>Case Law</option>
                              <option>Statutes</option>
                              <option>Regulations</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Date Range
                            </label>
                            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                              <option>All Time</option>
                              <option>Last Year</option>
                              <option>Last 5 Years</option>
                              <option>Last 10 Years</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {results.length} Results
                      </h3>
                      <button
                        onClick={() => onExport?.(results)}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        <Download className="h-4 w-4" />
                        Export Results
                      </button>
                    </div>

                    {results.map((result) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedResult(result)}
                        className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-lg p-2 ${getTypeColor(result.type)}`}>
                              {getResultIcon(result.type)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {result.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {result.citation}
                              </p>
                              {result.court && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                  {result.court} • {result.date}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                              <Star className="h-4 w-4 fill-current" />
                              <span>{(result.relevanceScore * 100).toFixed(0)}%</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveResult?.(result);
                              }}
                              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            >
                              <BookmarkPlus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {result.snippet}
                        </p>
                        {result.highlighted && result.highlighted.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.highlighted.map((term, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'sessions' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Research Sessions
                  </h3>
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {session.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {session.query}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.timestamp.toLocaleDateString()}
                            </span>
                            <span>{session.resultsCount} results</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <BookmarkPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    No Saved Results
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Results you save will appear here for easy access.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedResult && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:w-2/5"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedResult.title}
                  </h3>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.citation}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Content
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {selectedResult.snippet}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      <Highlighter className="h-4 w-4" />
                      Highlight
                    </button>
                    <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      <MessageSquare className="h-4 w-4" />
                      Note
                    </button>
                    <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {showAIAssist && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AI Research Assistant
                  </h3>
                  <button
                    onClick={() => setShowAIAssist(false)}
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Ask me anything about your legal research. I can help you:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Find relevant case law</li>
                    <li>• Analyze legal precedents</li>
                    <li>• Summarize complex documents</li>
                    <li>• Generate research memos</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Ask the AI assistant..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalResearchHub;

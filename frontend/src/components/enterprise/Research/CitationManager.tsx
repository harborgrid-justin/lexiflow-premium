/**
 * @module enterprise/Research/CitationManager
 * @category Enterprise Research
 * @description Citation management with Bluebook formatting, validation, and graph visualization
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  FileCode,
  FileText,
  GitBranch,
  Link2,
  Network,
  Plus,
  Search,
  Trash2,
  Upload,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CitationFormat = 'bluebook' | 'alwd' | 'apa' | 'chicago';
export type CitationType = 'case' | 'statute' | 'book' | 'article' | 'regulation';
export type CitationStatus = 'valid' | 'warning' | 'error' | 'unchecked';

export interface Citation {
  id: string;
  text: string;
  formatted: string;
  type: CitationType;
  status: CitationStatus;
  format: CitationFormat;
  sourceDocument?: string;
  footnoteNumber?: number;
  pageNumber?: number;
  metadata?: {
    court?: string;
    year?: string;
    volume?: string;
    reporter?: string;
    page?: string;
    jurisdiction?: string;
  };
  validationMessages?: string[];
  connections?: string[]; // IDs of related citations
}

export interface CitationGraph {
  nodes: Array<{
    id: string;
    label: string;
    type: CitationType;
    connections: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
  }>;
}

export interface CitationManagerProps {
  citations?: Citation[];
  onAddCitation?: (citation: Citation) => void;
  onUpdateCitation?: (id: string, citation: Partial<Citation>) => void;
  onDeleteCitation?: (id: string) => void;
  onValidateCitations?: (citations: Citation[]) => void;
  onExport?: (format: 'word' | 'latex' | 'json') => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const CitationManager: React.FC<CitationManagerProps> = ({
  citations: initialCitations = [],
  onAddCitation,
  onUpdateCitation,
  onDeleteCitation,
  onValidateCitations,
  onExport,
  className = '' }) => {
  const [citations, setCitations] = useState<Citation[]>(
    initialCitations.length > 0
      ? initialCitations
      : [
        {
          id: '1',
          text: 'Hadley v. Baxendale',
          formatted: 'Hadley v. Baxendale, 9 Ex. 341, 156 Eng. Rep. 145 (1854).',
          type: 'case',
          status: 'valid',
          format: 'bluebook',
          footnoteNumber: 1,
          metadata: {
            court: 'Court of Exchequer',
            year: '1854',
            volume: '9',
            reporter: 'Ex.',
            page: '341'
          },
          connections: ['2']
        },
        {
          id: '2',
          text: 'UCC § 2-714',
          formatted: 'U.C.C. § 2-714 (2023).',
          type: 'statute',
          status: 'valid',
          format: 'bluebook',
          footnoteNumber: 2,
          connections: ['1', '3']
        },
        {
          id: '3',
          text: 'Restatement (Second) of Contracts',
          formatted: 'Restatement (Second) of Contracts § 351 (1981).',
          type: 'book',
          status: 'warning',
          format: 'bluebook',
          footnoteNumber: 3,
          validationMessages: ['Check if latest edition is cited'],
          connections: ['2']
        },
      ]
  );

  const [activeView, setActiveView] = useState<'list' | 'graph' | 'footnotes'>('list');
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('bluebook');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAutoFormat = useCallback(() => {
    setCitations(prev => prev.map(cite => ({
      ...cite,
      formattedCitation: formatCitation(cite, selectedStyle)
    })));
  }, [selectedStyle]);

  const formatCitation = (citation: Omit<Citation, 'id' | 'formattedCitation'>, style: CitationStyle): string => {
    // Basic citation formatting
    if (style === 'bluebook') {
      return `${citation.title}, ${citation.court || ''} (${citation.year || 'n.d.'})`;
    }
    return `${citation.title} (${citation.year || 'n.d.'})`;
  };

  const [filterType, setType] = useState<CitationType | 'all'>('all');

  const filteredCitations = citations.filter((citation) => {
    const matchesSearch =
      searchQuery === '' ||
      citation.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citation.formatted.toLowerCase().includes(searchQuery.toLowerCase());
    const matches = filterType === 'all' || citation.type === filterType;
    return matchesSearch && matches;
  });

  const getStatusIcon = (status: CitationStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: CitationType) => {
    switch (type) {
      case 'case':
        return <FileText className="h-4 w-4" />;
      case 'statute':
        return <BookOpen className="h-4 w-4" />;
      case 'book':
        return <BookOpen className="h-4 w-4" />;
      case 'article':
        return <FileCode className="h-4 w-4" />;
      case 'regulation':
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: CitationType) => {
    switch (type) {
      case 'case':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'statute':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'book':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'article':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'regulation':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };

  const handleCopyCitation = (citation: Citation) => {
    navigator.clipboard.writeText(citation.formatted);
    // TODO: Show toast notification
  };

  const handleValidateAll = () => {
    onValidateCitations?.(citations);
    // TODO: Update citation statuses based on validation results
  };

  const handleAutoFormat = (citation: Citation) => {
    // TODO: Implement auto-formatting logic
    onUpdateCitation?.(citation.id, { formatted: citation.text });
  };

  const citationStats = {
    total: citations.length,
    valid: citations.filter((c) => c.status === 'valid').length,
    warnings: citations.filter((c) => c.status === 'warning').length,
    errors: citations.filter((c) => c.status === 'error').length
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Citation Manager
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Bluebook formatting, validation, and citation graph
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add Citation
            </button>
            <button
              onClick={handleValidateAll}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Zap className="h-4 w-4" />
              Validate All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {citationStats.total}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Citations</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {citationStats.valid}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Valid</div>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {citationStats.warnings}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Warnings</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {citationStats.errors}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Errors</div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveView('list')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeView === 'list'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              List View
            </div>
          </button>
          <button
            onClick={() => setActiveView('graph')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeView === 'graph'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Citation Graph
            </div>
          </button>
          <button
            onClick={() => setActiveView('footnotes')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeView === 'footnotes'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Footnotes
            </div>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citations..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setType(e.target.value as CitationType | 'all')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="case">Cases</option>
            <option value="statute">Statutes</option>
            <option value="book">Books</option>
            <option value="article">Articles</option>
            <option value="regulation">Regulations</option>
          </select>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as CitationFormat)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="bluebook">Bluebook</option>
            <option value="alwd">ALWD</option>
            <option value="apa">APA</option>
            <option value="chicago">Chicago</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => onExport?.('word')}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Import"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeView === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {filteredCitations.map((citation) => (
                <motion.div
                  key={citation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">{getStatusIcon(citation.status)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {citation.footnoteNumber && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {citation.footnoteNumber}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(citation.type)}`}
                          >
                            {getTypeIcon(citation.type)}
                            {citation.type}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopyCitation(citation)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Copy"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCitation(citation)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCitation?.(citation.id)}
                            className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {citation.text}
                      </p>
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        {citation.formatted}
                      </p>
                      {citation.validationMessages && citation.validationMessages.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {citation.validationMessages.map((msg, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-yellow-700 dark:text-yellow-400"
                            >
                              ⚠ {msg}
                            </p>
                          ))}
                        </div>
                      )}
                      {citation.connections && citation.connections.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <GitBranch className="h-3 w-3" />
                          <span>{citation.connections.length} connections</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredCitations.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <Link2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    No Citations Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search or filters.'
                      : 'Add your first citation to get started.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'graph' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
            >
              <Network className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Citation Network Graph
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Visual representation of citation relationships and dependencies.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-left">
                {citations.slice(0, 3).map((citation) => (
                  <div
                    key={citation.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div
                      className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(citation.type)}`}
                    >
                      {getTypeIcon(citation.type)}
                      {citation.type}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {citation.text}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <GitBranch className="h-3 w-3" />
                      {citation.connections?.length || 0} connections
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'footnotes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Footnote Preview
                </h3>
                <div className="space-y-4">
                  {citations
                    .filter((c) => c.footnoteNumber)
                    .sort((a, b) => (a.footnoteNumber || 0) - (b.footnoteNumber || 0))
                    .map((citation) => (
                      <div
                        key={citation.id}
                        className="border-l-2 border-blue-500 pl-4 text-sm"
                      >
                        <sup className="mr-1 font-medium text-blue-600 dark:text-blue-400">
                          {citation.footnoteNumber}
                        </sup>
                        <span className="text-gray-700 dark:text-gray-300">
                          {citation.formatted}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CitationManager;

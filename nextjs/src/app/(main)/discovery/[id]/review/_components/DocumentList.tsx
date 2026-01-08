'use client';

/**
 * Document List Component
 * Sidebar list of documents in the review queue
 */

import { useState, useMemo } from 'react';
import { Input, Badge } from '@/components/ui';
import {
  Search,
  FileText,
  Image,
  Mail,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import type { ReviewDocument, ReviewStatusValue } from '../../../_types';

interface DocumentListProps {
  documents: ReviewDocument[];
  selectedId?: string;
  onSelect: (document: ReviewDocument) => void;
}

const statusIcons: Record<ReviewStatusValue, React.ReactNode> = {
  not_reviewed: <Clock className="h-3 w-3" />,
  in_review: <Clock className="h-3 w-3 text-blue-500" />,
  reviewed: <CheckCircle className="h-3 w-3 text-green-500" />,
  flagged: <AlertTriangle className="h-3 w-3 text-amber-500" />,
};

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }
  if (type.includes('email') || type.includes('msg') || type.includes('eml')) {
    return <Mail className="h-4 w-4 text-purple-500" />;
  }
  return <FileText className="h-4 w-4 text-slate-500" />;
}

export function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'not_reviewed' | 'reviewed' | 'flagged'>('all');

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((doc) => doc.reviewStatus === filter);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(searchLower) ||
          doc.custodian?.toLowerCase().includes(searchLower) ||
          doc.extractedText?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [documents, filter, search]);

  const counts = useMemo(() => {
    return {
      all: documents.length,
      not_reviewed: documents.filter((d) => d.reviewStatus === 'not_reviewed').length,
      reviewed: documents.filter((d) => d.reviewStatus === 'reviewed').length,
      flagged: documents.filter((d) => d.reviewStatus === 'flagged').length,
    };
  }, [documents]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {(['all', 'not_reviewed', 'reviewed', 'flagged'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              filter === f
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'not_reviewed' ? 'Pending' : f === 'reviewed' ? 'Done' : 'Flagged'}
            <span className="ml-1 text-slate-400">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText className="h-8 w-8 mb-2" />
            <p className="text-sm">No documents found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelect(doc)}
                className={`w-full p-3 text-left transition-colors ${
                  selectedId === doc.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {doc.fileName}
                      </p>
                      {statusIcons[doc.reviewStatus]}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {doc.custodian}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.coding.responsive !== 'not_coded' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          doc.coding.responsive === 'yes'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : doc.coding.responsive === 'no'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {doc.coding.responsive === 'yes' ? 'R' : doc.coding.responsive === 'no' ? 'NR' : '?'}
                        </span>
                      )}
                      {doc.coding.privileged === 'yes' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          P
                        </span>
                      )}
                      {doc.tags && doc.tags.length > 0 && (
                        <span className="text-xs text-slate-400">
                          +{doc.tags.length} tags
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>
    </div>
  );
}

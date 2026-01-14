/**
 * DocumentCard Component
 * Card-based display for documents in grid view
 */

import { Link } from 'react-router';
import type { LegalDocument } from '@/types/documents';
import { formatDate } from '@/utils/formatters';

interface DocumentCardProps {
  document: LegalDocument;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function DocumentCard({ document, onDelete, onDownload, selected, onSelect }: DocumentCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Final':
      case 'Signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Filed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconClass = "h-10 w-10 text-gray-400";

    if (type.includes('PDF')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="7" y="17" fontSize="6" fill="white">PDF</text>
        </svg>
      );
    }

    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(document.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Document Icon */}
      <div className="mb-3 flex items-center justify-center">
        {getTypeIcon(document.type)}
      </div>

      {/* Document Title */}
      <Link
        to={`/documents/${document.id}`}
        className="block font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 mb-2 line-clamp-2"
      >
        {document.title}
      </Link>

      {/* Metadata */}
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center justify-between">
          <span>{document.type}</span>
          <span>{document.fileSize}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Modified: {formatDate(document.lastModified)}</span>
        </div>
      </div>

      {/* Status Badge */}
      {document.status && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>
      )}

      {/* Privilege & OCR Indicators */}
      <div className="flex items-center gap-2 mb-3">
        {document.isRedacted && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Privileged
          </span>
        )}
        {document.ocrProcessed && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            OCR
          </span>
        )}
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{document.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onDownload?.(document.id)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="Download"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(document.id)}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
            title="Delete"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

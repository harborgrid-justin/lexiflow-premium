/**
 * DocumentRow Component
 * Table row display for documents in list view
 */

import { Link } from 'react-router';

import { formatDate } from '@/utils/formatters';

import type { LegalDocument } from '@/types/documents';

interface DocumentRowProps {
  document: LegalDocument;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function DocumentRow({ document, onDelete, onDownload, selected, onSelect }: DocumentRowProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Final':
      case 'Signed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Filed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  return (
    <tr className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
      {/* Checkbox */}
      {onSelect && (
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(document.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
      )}

      {/* Title */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex flex-col">
            <Link
              to={`/documents/${document.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
              {document.title}
            </Link>
            {document.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {document.description}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {document.type}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {document.status && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        )}
      </td>

      {/* Indicators */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {document.isRedacted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" title="Privileged">
              P
            </span>
          )}
          {document.ocrProcessed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" title="OCR Processed">
              OCR
            </span>
          )}
        </div>
      </td>

      {/* Size */}
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {document.fileSize}
      </td>

      {/* Modified */}
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(document.lastModified)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload?.(document.id)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Download"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

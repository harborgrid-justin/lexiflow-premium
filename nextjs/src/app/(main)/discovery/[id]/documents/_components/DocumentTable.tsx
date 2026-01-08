'use client';

/**
 * Document Table Component
 * Displays documents with selection and actions
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Table } from '@/components/ui';
import {
  FileText,
  Image,
  FileSpreadsheet,
  Mail,
  File,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Download,
  Tag,
} from 'lucide-react';
import type { ReviewDocument, ReviewStatusValue, DocumentCodingResponsiveValue } from '../../../_types';
import { updateReviewStatus, updateDocumentCoding } from '../../../_actions';

interface DocumentTableProps {
  documents: ReviewDocument[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  /** Controlled selection state - if provided, component operates in controlled mode */
  selectedIds?: Set<string>;
  /** Callback when selection changes - required when selectedIds is provided */
  onSelectionChange?: (ids: Set<string>) => void;
}

const reviewStatusConfig: Record<ReviewStatusValue, {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon: React.ReactNode;
}> = {
  not_reviewed: { label: 'Not Reviewed', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  in_review: { label: 'In Review', variant: 'info', icon: <Eye className="h-3 w-3" /> },
  reviewed: { label: 'Reviewed', variant: 'success', icon: <CheckCircle className="h-3 w-3" /> },
  flagged: { label: 'Flagged', variant: 'warning', icon: <AlertTriangle className="h-3 w-3" /> },
};

const responsiveConfig: Record<DocumentCodingResponsiveValue, {
  label: string;
  color: string;
}> = {
  yes: { label: 'Yes', color: 'text-green-600 dark:text-green-400' },
  no: { label: 'No', color: 'text-red-600 dark:text-red-400' },
  maybe: { label: 'Maybe', color: 'text-amber-600 dark:text-amber-400' },
  not_coded: { label: '-', color: 'text-slate-400' },
};

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) {
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  }
  if (type.includes('email') || type.includes('msg') || type.includes('eml')) {
    return <Mail className="h-4 w-4 text-purple-500" />;
  }
  return <File className="h-4 w-4 text-slate-500" />;
}

export function DocumentTable({
  documents,
  totalCount,
  currentPage,
  totalPages,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
}: DocumentTableProps) {
  const params = useParams();
  const discoveryId = params.id as string;
  // Support both controlled and uncontrolled selection modes
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled ? controlledSelectedIds : internalSelectedIds;

  const updateSelection = (newIds: Set<string>) => {
    if (isControlled && onSelectionChange) {
      onSelectionChange(newIds);
    } else {
      setInternalSelectedIds(newIds);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateSelection(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      updateSelection(new Set());
    } else {
      updateSelection(new Set(documents.map((d) => d.id)));
    }
  };

  const handleMarkReviewed = (id: string) => {
    startTransition(async () => {
      await updateReviewStatus(id, 'reviewed');
      setActiveMenu(null);
    });
  };

  const handleFlag = (id: string) => {
    startTransition(async () => {
      await updateReviewStatus(id, 'flagged');
      setActiveMenu(null);
    });
  };

  const handleMarkResponsive = (id: string, responsive: DocumentCodingResponsiveValue) => {
    startTransition(async () => {
      await updateDocumentCoding(id, { responsive });
      setActiveMenu(null);
    });
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedIds.size === documents.length && documents.length > 0}
          onChange={toggleSelectAll}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      accessor: (row: ReviewDocument) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      header: 'Document',
      accessor: (row: ReviewDocument) => (
        <div className="flex items-center gap-3 min-w-0">
          {getFileIcon(row.fileType)}
          <div className="min-w-0">
            <Link
              href={`/discovery/${discoveryId}/review?docId=${row.id}`}
              className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate max-w-[200px]"
            >
              {row.fileName}
            </Link>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">
              {row.custodian} | {formatFileSize(row.fileSize)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (row: ReviewDocument) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {new Date(row.dateCreated).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: ReviewDocument) => {
        const config = reviewStatusConfig[row.reviewStatus];
        return (
          <Badge variant={config.variant} className="inline-flex items-center gap-1">
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: 'Responsive',
      accessor: (row: ReviewDocument) => {
        const config = responsiveConfig[row.coding.responsive];
        return (
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      header: 'Privileged',
      accessor: (row: ReviewDocument) => (
        <span className={`text-sm ${
          row.coding.privileged === 'yes'
            ? 'text-purple-600 dark:text-purple-400 font-medium'
            : row.coding.privileged === 'no'
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-400'
        }`}>
          {row.coding.privileged === 'yes' ? (
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Yes
            </span>
          ) : row.coding.privileged === 'no' ? 'No' : '-'}
        </span>
      ),
    },
    {
      header: 'Tags',
      accessor: (row: ReviewDocument) => (
        <div className="flex gap-1 flex-wrap">
          {row.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
            >
              {tag}
            </span>
          ))}
          {(row.tags?.length || 0) > 2 && (
            <span className="text-xs text-slate-400">
              +{(row.tags?.length || 0) - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: '',
      accessor: (row: ReviewDocument) => (
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            disabled={isPending}
          >
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </button>

          {activeMenu === row.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
              <Link
                href={`/discovery/${discoveryId}/review?docId=${row.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Eye className="h-4 w-4" />
                View Document
              </Link>
              <button
                onClick={() => handleMarkReviewed(row.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Reviewed
              </button>
              <button
                onClick={() => handleFlag(row.id)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <AlertTriangle className="h-4 w-4" />
                Flag for Review
              </button>
              <hr className="my-1 border-slate-200 dark:border-slate-700" />
              <button
                onClick={() => handleMarkResponsive(row.id, 'yes')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Responsive: Yes
              </button>
              <button
                onClick={() => handleMarkResponsive(row.id, 'no')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Responsive: No
              </button>
              <hr className="my-1 border-slate-200 dark:border-slate-700" />
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Tag className="h-4 w-4" />
                Add Tag
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {documents.length} of {totalCount.toLocaleString()} documents
          {selectedIds.size > 0 && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              ({selectedIds.size} selected)
            </span>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <Table columns={columns} data={documents} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/discovery/${discoveryId}/documents`}
          />
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center gap-1">
      <Link
        href={`${baseUrl}?page=${Math.max(1, currentPage - 1)}`}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === 1
            ? 'text-slate-400 cursor-not-allowed pointer-events-none'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        Previous
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`px-3 py-2 text-sm rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {page}
        </Link>
      ))}
      <Link
        href={`${baseUrl}?page=${Math.min(totalPages, currentPage + 1)}`}
        className={`px-3 py-2 text-sm rounded-md ${
          currentPage === totalPages
            ? 'text-slate-400 cursor-not-allowed pointer-events-none'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        Next
      </Link>
    </nav>
  );
}

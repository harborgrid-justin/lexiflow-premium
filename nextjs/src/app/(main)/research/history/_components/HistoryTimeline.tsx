'use client';

/**
 * History Timeline Component
 * Displays research history in a timeline format
 *
 * @module research/history/_components/HistoryTimeline
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  Bookmark,
  BookmarkMinus,
  Download,
  FileText,
  Scale,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import type { ResearchSessionEntity, ResearchTrailEntry, ResearchActionType } from '@/types/research';
import { deleteResearchSession, bookmarkSession } from '../../actions';

interface HistoryTimelineProps {
  sessions: ResearchSessionEntity[];
  trailEntries: ResearchTrailEntry[];
  currentPage: number;
  totalPages: number;
}

export function HistoryTimeline({
  sessions,
  trailEntries,
  currentPage,
  totalPages,
}: HistoryTimelineProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Group entries by date
  const groupedEntries = groupByDate(sessions);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this research session?')) return;

    startTransition(async () => {
      await deleteResearchSession(id);
      router.refresh();
    });
  };

  const handleToggleBookmark = async (id: string, isBookmarked: boolean) => {
    startTransition(async () => {
      await bookmarkSession(id, !isBookmarked);
      router.refresh();
    });
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="mt-6 text-lg font-medium text-slate-900 dark:text-white">
          No research history
        </h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Your research activity will appear here. Start a search to begin
          building your research trail.
        </p>
        <Link
          href="/research"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Search className="h-5 w-5" />
          Start Research
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([date, entries]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="sticky top-0 z-10 py-2 bg-slate-50 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {formatDateHeader(date)}
            </h2>
          </div>

          {/* Timeline */}
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            {entries.map((session) => (
              <TimelineEntry
                key={session.id}
                session={session}
                onDelete={() => handleDelete(session.id)}
                onToggleBookmark={() =>
                  handleToggleBookmark(session.id, session.isBookmarked)
                }
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Link
            href={`/research/history?page=${Math.max(1, currentPage - 1)}`}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>

          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={`/research/history?page=${Math.min(totalPages, currentPage + 1)}`}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Timeline Entry Component
function TimelineEntry({
  session,
  onDelete,
  onToggleBookmark,
  isPending,
}: {
  session: ResearchSessionEntity;
  onDelete: () => void;
  onToggleBookmark: () => void;
  isPending: boolean;
}) {
  return (
    <div className="relative group">
      {/* Timeline Dot */}
      <div className="absolute -left-[1.3rem] top-4 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow" />

      {/* Card */}
      <Link
        href={`/research/${session.id}`}
        className="block ml-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 dark:text-white truncate">
                  {session.query}
                </h3>

                {/* Meta */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(session.timestamp)}
                  </span>
                  <span>
                    {session.results?.length || 0} results
                  </span>
                  {session.sources && session.sources.length > 0 && (
                    <span className="capitalize">{session.sources[0]}</span>
                  )}
                  {session.duration && (
                    <span>{formatDuration(session.duration)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleBookmark();
                  }}
                  disabled={isPending}
                  className={`p-2 rounded-lg transition-colors ${
                    session.isBookmarked
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={session.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <Star
                    className={`h-4 w-4 ${session.isBookmarked ? 'fill-current' : ''}`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  disabled={isPending}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Result Preview */}
            {session.results && session.results.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {session.results.slice(0, 3).map((result, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                  >
                    <Scale className="h-3 w-3" />
                    {truncate(result.title, 30)}
                  </span>
                ))}
                {session.results.length > 3 && (
                  <span className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                    +{session.results.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// Helper Functions

function groupByDate(
  sessions: ResearchSessionEntity[]
): Record<string, ResearchSessionEntity[]> {
  const grouped: Record<string, ResearchSessionEntity[]> = {};

  sessions.forEach((session) => {
    const date = new Date(session.timestamp).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(session);
  });

  return grouped;
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

function getActionIcon(actionType: ResearchActionType): React.ElementType {
  switch (actionType) {
    case 'search':
      return Search;
    case 'view_case':
    case 'view_statute':
    case 'view_document':
      return Eye;
    case 'bookmark':
      return Bookmark;
    case 'unbookmark':
      return BookmarkMinus;
    case 'export':
      return Download;
    default:
      return FileText;
  }
}

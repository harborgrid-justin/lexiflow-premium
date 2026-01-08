'use client';

/**
 * Recent Activity Component
 * Displays recent research sessions and bookmarks in sidebar
 *
 * @module research/_components/RecentActivity
 */

import Link from 'next/link';
import {
  Search,
  Bookmark,
  Clock,
  ChevronRight,
  ExternalLink,
  Scale,
  FileText,
  BookOpen,
} from 'lucide-react';
import type { ResearchSessionEntity, ResearchBookmark, ResearchItemType } from '@/types/research';

interface RecentActivityProps {
  sessions: ResearchSessionEntity[];
  bookmarks: ResearchBookmark[];
}

export function RecentActivity({ sessions, bookmarks }: RecentActivityProps) {
  const hasContent = sessions.length > 0 || bookmarks.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          Recent Activity
        </h2>
      </div>

      {hasContent ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {/* Recent Searches */}
          {sessions.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Recent Searches
              </h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <ActivityItem
                    key={session.id}
                    href={`/research/${session.id}`}
                    icon={Search}
                    iconColor="text-blue-500"
                    title={session.query}
                    subtitle={`${session.results?.length || 0} results`}
                    timestamp={session.timestamp}
                  />
                ))}
              </div>
              {sessions.length > 5 && (
                <Link
                  href="/research/history"
                  className="mt-3 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all history
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>
          )}

          {/* Recent Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Recent Bookmarks
              </h3>
              <div className="space-y-2">
                {bookmarks.slice(0, 5).map((bookmark) => (
                  <BookmarkItem key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
              {bookmarks.length > 5 && (
                <Link
                  href="/research/saved"
                  className="mt-3 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all bookmarks
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
            No recent activity
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your research history will appear here
          </p>
        </div>
      )}
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  href,
  icon: Icon,
  iconColor,
  title,
  subtitle,
  timestamp,
}: {
  href: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  timestamp: string;
}) {
  const formattedTime = formatTimestamp(timestamp);

  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
    >
      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {title}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{subtitle}</span>
          <span>-</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </Link>
  );
}

// Bookmark Item Component
function BookmarkItem({ bookmark }: { bookmark: ResearchBookmark }) {
  const Icon = getItemTypeIcon(bookmark.itemType);
  const formattedTime = formatTimestamp(bookmark.createdAt || '');

  return (
    <div className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
        <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {bookmark.title}
        </p>
        {bookmark.citation && (
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {bookmark.citation}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          <span className="capitalize">{bookmark.itemType.replace('_', ' ')}</span>
          {formattedTime && (
            <>
              <span>-</span>
              <span>{formattedTime}</span>
            </>
          )}
        </div>
      </div>
      {bookmark.sourceUrl && (
        <a
          href={bookmark.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

// Helper Functions

function getItemTypeIcon(itemType: ResearchItemType): React.ElementType {
  switch (itemType) {
    case 'case_law':
      return Scale;
    case 'statute':
    case 'regulation':
      return FileText;
    case 'secondary_source':
    case 'treatise':
    case 'law_review':
    case 'practice_guide':
      return BookOpen;
    default:
      return Bookmark;
  }
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

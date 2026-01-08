'use client';

/**
 * Bookmarks List Component
 * Displays and manages research bookmarks with folder organization
 *
 * @module research/saved/_components/BookmarksList
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  Folder,
  FolderPlus,
  Scale,
  FileText,
  BookOpen,
  ExternalLink,
  Trash2,
  Edit2,
  MoreHorizontal,
  Tag,
  ChevronRight,
} from 'lucide-react';
import type { ResearchBookmark, ResearchFolder, ResearchItemType } from '@/types/research';
import { deleteBookmark, updateBookmark } from '../../actions';

interface BookmarksListProps {
  bookmarks: ResearchBookmark[];
  folders: ResearchFolder[];
  activeFolderId?: string;
}

export function BookmarksList({
  bookmarks,
  folders,
  activeFolderId,
}: BookmarksListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this bookmark?')) return;

    startTransition(async () => {
      await deleteBookmark(id);
      router.refresh();
    });
  };

  // Filter bookmarks by folder
  const filteredBookmarks = activeFolderId
    ? bookmarks.filter((b) => b.folderId === activeFolderId)
    : bookmarks.filter((b) => !b.folderId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Folders */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Folders
            </h3>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          <div className="p-2">
            {/* All Bookmarks */}
            <Link
              href="/research/saved?tab=bookmarks"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                !activeFolderId
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span className="text-sm">All Bookmarks</span>
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                {bookmarks.length}
              </span>
            </Link>

            {/* Folder List */}
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/research/saved?tab=bookmarks&folder=${folder.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFolderId === folder.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Folder
                  className="h-4 w-4"
                  style={{ color: folder.color || undefined }}
                />
                <span className="text-sm truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                  {folder.itemCount || 0}
                </span>
              </Link>
            ))}

            {folders.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                No folders yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Bookmarks */}
      <div className="lg:col-span-3">
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              {activeFolderId ? 'No bookmarks in this folder' : 'No bookmarks yet'}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Bookmark cases, statutes, and other research to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                isMenuOpen={activeMenuId === bookmark.id}
                onMenuToggle={() =>
                  setActiveMenuId(activeMenuId === bookmark.id ? null : bookmark.id)
                }
                onDelete={() => handleDelete(bookmark.id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bookmark Card Component
function BookmarkCard({
  bookmark,
  isMenuOpen,
  onMenuToggle,
  onDelete,
  isPending,
}: {
  bookmark: ResearchBookmark;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const Icon = getItemTypeIcon(bookmark.itemType);
  const typeLabel = getItemTypeLabel(bookmark.itemType);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {bookmark.title}
              </h3>
              {bookmark.citation && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {bookmark.citation}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {bookmark.sourceUrl && (
                <a
                  href={bookmark.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  title="Open source"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div className="relative">
                <button
                  onClick={onMenuToggle}
                  className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                    <button
                      onClick={onMenuToggle}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Notes
                    </button>
                    <button
                      onClick={onMenuToggle}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Folder className="h-4 w-4" />
                      Move to Folder
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        onDelete();
                        onMenuToggle();
                      }}
                      disabled={isPending}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded capitalize">
              {typeLabel}
            </span>
            <span className="capitalize">{bookmark.source}</span>
            {bookmark.createdAt && (
              <span>
                Saved {new Date(bookmark.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Notes */}
          {bookmark.notes && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">
              {bookmark.notes}
            </p>
          )}

          {/* Highlights */}
          {bookmark.highlights && bookmark.highlights.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Highlights ({bookmark.highlights.length})
              </h4>
              {bookmark.highlights.slice(0, 2).map((highlight) => (
                <div
                  key={highlight.id}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-400 rounded-r-lg"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {highlight.text}
                  </p>
                  {highlight.annotation && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Note: {highlight.annotation}
                    </p>
                  )}
                </div>
              ))}
              {bookmark.highlights.length > 2 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  + {bookmark.highlights.length - 2} more highlights
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
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

function getItemTypeLabel(itemType: ResearchItemType): string {
  switch (itemType) {
    case 'case_law':
      return 'Case Law';
    case 'statute':
      return 'Statute';
    case 'regulation':
      return 'Regulation';
    case 'secondary_source':
      return 'Secondary Source';
    case 'treatise':
      return 'Treatise';
    case 'law_review':
      return 'Law Review';
    case 'practice_guide':
      return 'Practice Guide';
    case 'form':
      return 'Form';
    case 'news':
      return 'News';
    case 'blog':
      return 'Blog';
    default:
      return itemType;
  }
}

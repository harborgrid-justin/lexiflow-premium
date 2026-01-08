'use client';

/**
 * Research Detail Header Component
 * Displays header with title, breadcrumb, and actions
 *
 * @module research/[id]/_components/ResearchDetailHeader
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Star,
  Share2,
  Download,
  MoreHorizontal,
  Trash2,
  Edit,
  FolderOpen,
  Search,
} from 'lucide-react';
import type { ResearchSessionEntity, ResearchProject } from '@/types/research';
import {
  bookmarkSession,
  deleteResearchSession,
  deleteResearchProject,
  exportResearch,
} from '../../actions';

interface ResearchDetailHeaderProps {
  type: 'session' | 'project';
  data: ResearchSessionEntity | ResearchProject;
}

export function ResearchDetailHeader({ type, data }: ResearchDetailHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);

  const isSession = type === 'session';
  const session = isSession ? (data as ResearchSessionEntity) : null;
  const project = !isSession ? (data as ResearchProject) : null;

  const title = isSession ? session?.query : project?.title;
  const isBookmarked = isSession && session?.isBookmarked;

  const handleBookmark = async () => {
    if (!isSession || !session) return;

    startTransition(async () => {
      await bookmarkSession(session.id, !session.isBookmarked);
      router.refresh();
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type}?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = isSession
        ? await deleteResearchSession(data.id)
        : await deleteResearchProject(data.id);

      if (result.success) {
        router.push('/research');
      }
    });
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    startTransition(async () => {
      const result = await exportResearch([data.id], format, {
        includeAnnotations: true,
        includeCitations: true,
      });

      if (result.success && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank');
      }
    });
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            href="/research"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Research
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-200 font-medium">
            {isSession ? 'Session' : 'Project'}
          </span>
        </nav>

        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-lg ${
                  isSession
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-purple-100 dark:bg-purple-900/30'
                }`}
              >
                {isSession ? (
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h1>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              {!isSession && project?.status && (
                <span
                  className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    statusColors[project.status]
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              )}

              {isSession && session?.timestamp && (
                <span>
                  {new Date(session.timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}

              {isSession && session?.results && (
                <span>{session.results.length} results</span>
              )}

              {!isSession && project?.jurisdictions?.length > 0 && (
                <span>{project.jurisdictions.join(', ')}</span>
              )}

              {!isSession && project?.dueDate && (
                <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isSession && (
              <button
                onClick={handleBookmark}
                disabled={isPending}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Star className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={() => navigator.share?.({ title, url: window.location.href })}
              className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                  <button
                    onClick={() => {
                      handleExport('pdf');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      handleExport('docx');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as Word
                  </button>
                  {!isSession && (
                    <Link
                      href={`/research/${data.id}/edit`}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Project
                    </Link>
                  )}
                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
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
      </div>
    </header>
  );
}

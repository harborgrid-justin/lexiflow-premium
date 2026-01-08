/**
 * Research Sidebar Component
 * Displays metadata and related information
 *
 * @module research/[id]/_components/ResearchSidebar
 */

import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Tag,
  MapPin,
  Briefcase,
  Users,
  Database,
  ExternalLink,
} from 'lucide-react';
import type { ResearchSessionEntity, ResearchProject } from '@/types/research';

interface ResearchSidebarProps {
  type: 'session' | 'project';
  data: ResearchSessionEntity | ResearchProject;
}

export function ResearchSidebar({ type, data }: ResearchSidebarProps) {
  const isSession = type === 'session';
  const session = isSession ? (data as ResearchSessionEntity) : null;
  const project = !isSession ? (data as ResearchProject) : null;

  return (
    <div className="space-y-6">
      {/* Details Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Details
        </h3>

        <dl className="space-y-4">
          {/* Created Date */}
          <div className="flex items-start gap-3">
            <dt className="flex-shrink-0">
              <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
            </dt>
            <dd>
              <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
              <p className="text-sm text-slate-900 dark:text-white">
                {new Date(data.createdAt || '').toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </dd>
          </div>

          {/* Duration (sessions) */}
          {isSession && session?.duration && (
            <div className="flex items-start gap-3">
              <dt className="flex-shrink-0">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
              </dt>
              <dd>
                <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatDuration(session.duration)}
                </p>
              </dd>
            </div>
          )}

          {/* Due Date (projects) */}
          {!isSession && project?.dueDate && (
            <div className="flex items-start gap-3">
              <dt className="flex-shrink-0">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
              </dt>
              <dd>
                <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(project.dueDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </dd>
            </div>
          )}

          {/* Hours (projects) */}
          {!isSession && (project?.estimatedHours || project?.actualHours) && (
            <div className="flex items-start gap-3">
              <dt className="flex-shrink-0">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
              </dt>
              <dd>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hours</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {project.actualHours || 0} / {project.estimatedHours || 0} hours
                </p>
                {project.estimatedHours && (
                  <div className="mt-1 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((project.actualHours || 0) / project.estimatedHours) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </dd>
            </div>
          )}

          {/* Sources (sessions) */}
          {isSession && session?.sources && session.sources.length > 0 && (
            <div className="flex items-start gap-3">
              <dt className="flex-shrink-0">
                <Database className="h-4 w-4 text-slate-400 mt-0.5" />
              </dt>
              <dd>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sources</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {session.sources.map((source) => (
                    <span
                      key={source}
                      className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded capitalize"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Jurisdictions (projects) */}
      {!isSession && project?.jurisdictions && project.jurisdictions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-slate-400" />
            Jurisdictions
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.jurisdictions.map((jurisdiction) => (
              <span
                key={jurisdiction}
                className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg"
              >
                {jurisdiction}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Practice Areas (projects) */}
      {!isSession && project?.practiceAreas && project.practiceAreas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-slate-400" />
            Practice Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.practiceAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {!isSession && project?.tags && project.tags.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-slate-400" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Collaborators (projects) */}
      {!isSession && project?.collaborators && project.collaborators.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-slate-400" />
            Collaborators
          </h3>
          <div className="space-y-2">
            {project.collaborators.map((userId) => (
              <div
                key={userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {userId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Links */}
      {!isSession && (project?.caseId || project?.matterId) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Related
          </h3>
          <div className="space-y-2">
            {project.caseId && (
              <Link
                href={`/cases/${project.caseId}`}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Linked Case
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
            )}
            {project.matterId && (
              <Link
                href={`/matters/${project.matterId}`}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Linked Matter
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Functions

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

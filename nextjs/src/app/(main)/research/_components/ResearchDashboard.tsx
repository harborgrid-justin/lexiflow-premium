'use client';

/**
 * Research Dashboard Component
 * Displays recent projects, sessions, and alerts
 *
 * @module research/_components/ResearchDashboard
 */

import Link from 'next/link';
import {
  FileText,
  Clock,
  Bell,
  AlertTriangle,
  ChevronRight,
  FolderOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import type {
  ResearchProject,
  ResearchSessionEntity,
  SavedSearch,
} from '@/types/research';

interface ResearchDashboardProps {
  recentProjects: ResearchProject[];
  recentSessions: ResearchSessionEntity[];
  pendingAlerts: SavedSearch[];
}

export function ResearchDashboard({
  recentProjects,
  recentSessions,
  pendingAlerts,
}: ResearchDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Active Research Projects */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Active Research Projects
          </h2>
          <Link
            href="/research/new"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            New Project
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No active projects"
              description="Create a new research project to get started"
              action={{ href: '/research/new', label: 'Create Project' }}
            />
          )}
        </div>
      </section>

      {/* Recent Research Sessions */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Recent Sessions
          </h2>
          <Link
            href="/research/history"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentSessions.length > 0 ? (
            recentSessions.slice(0, 5).map((session) => (
              <SessionRow key={session.id} session={session} />
            ))
          ) : (
            <EmptyState
              icon={Search}
              title="No recent sessions"
              description="Start a new search to begin your research"
              action={{ href: '/research', label: 'Start Search' }}
            />
          )}
        </div>
      </section>

      {/* Search Alerts */}
      {pendingAlerts.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Search Alerts
            </h2>
            <Link
              href="/research/saved"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Manage Alerts
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {pendingAlerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Project Row Component
function ProjectRow({ project }: { project: ResearchProject }) {
  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
  };

  return (
    <Link
      href={`/research/${project.id}`}
      className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white truncate">
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
              {project.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {project.jurisdictions?.length > 0 && (
              <span>{project.jurisdictions.slice(0, 2).join(', ')}</span>
            )}
            {project.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due {new Date(project.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <span
          className={`ml-4 px-2.5 py-0.5 text-xs font-medium rounded-full ${
            statusColors[project.status]
          }`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>
    </Link>
  );
}

// Session Row Component
function SessionRow({ session }: { session: ResearchSessionEntity }) {
  return (
    <Link
      href={`/research/${session.id}`}
      className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {session.query}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {session.results?.length || 0} results
            </span>
            <span>{new Date(session.timestamp).toLocaleDateString()}</span>
            {session.sources?.length > 0 && (
              <span className="capitalize">{session.sources[0]}</span>
            )}
          </div>
        </div>
        {session.isBookmarked && (
          <span className="text-amber-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
}

// Alert Row Component
function AlertRow({ alert }: { alert: SavedSearch }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {alert.name}
          </p>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 truncate">
            {alert.query}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="capitalize">{alert.alertFrequency} alerts</span>
            {alert.lastAlertDate && (
              <span>
                Last: {new Date(alert.lastAlertDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <Link
        href={`/research/saved?execute=${alert.id}`}
        className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      >
        Run Search
      </Link>
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="px-6 py-12 text-center">
      <Icon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
      <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {action.label}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

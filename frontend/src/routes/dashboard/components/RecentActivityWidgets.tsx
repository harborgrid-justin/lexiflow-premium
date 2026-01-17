import { type DocketEntry, type TimeEntry } from "@/types";

/**
 * Deferred Data Skeleton
 * Shows while deferred data is streaming
 */
export function DeferredDataSkeleton({ title }: { title: string }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg border border-[var(--color-border)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
        <div
          style={{ backgroundColor: "var(--color-surface-hover)" }}
          className="h-6 w-20 rounded animate-pulse"
        />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ backgroundColor: "var(--color-surface-hover)" }}
            className="h-16 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Deferred Data Error
 * Shows when deferred data fails to load
 */
export function DeferredDataError() {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg border-2 border-rose-200"
    >
      <p className="text-rose-600 text-sm">Failed to load data</p>
    </div>
  );
}

/**
 * Dashboard Recent Docket
 * Displays recent docket entries (deferred data)
 */
export function DashboardRecentDocket({ entries }: { entries: DocketEntry[] | undefined }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg border border-[var(--color-border)]"
    >
      <h3 className="font-semibold mb-4 text-[var(--color-text)]">Recent Docket Entries</h3>
      {entries && entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition"
            >
              <p className="text-sm font-medium text-[var(--color-text)]">{entry.entryNumber || 'N/A'}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {entry.filingDate ? new Date(entry.filingDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">No recent entries</p>
      )}
    </div>
  );
}

/**
 * Dashboard Recent Time
 * Displays recent time entries (deferred data)
 */
export function DashboardRecentTime({ entries }: { entries: TimeEntry[] | undefined }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg border border-[var(--color-border)]"
    >
      <h3 className="font-semibold mb-4 text-[var(--color-text)]">Recent Time Entries</h3>
      {entries && entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition"
            >
              <p className="text-sm font-medium text-[var(--color-text)]">{entry.description || 'Time entry'}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-xs font-semibold text-[var(--color-primary)]">
                  {entry.hours || entry.duration || 0}h
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">No recent time entries</p>
      )}
    </div>
  );
}

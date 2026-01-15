/**
 * VersionHistory Component
 * Display and manage document version history
 */

import type { DocumentVersion } from '@/types/documents';
import { formatDate } from '@/utils/formatters';

interface VersionHistoryProps {
  versions: readonly DocumentVersion[];
  currentVersion?: number;
  onRestore?: (versionNumber: number) => void;
  onCompare?: (v1: number, v2: number) => void;
}

export function VersionHistory({ versions, currentVersion, onRestore, onCompare }: VersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Version History
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      {sortedVersions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No version history available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVersions.map((version, index) => {
            const isCurrent = version.versionNumber === currentVersion;

            return (
              <div
                key={version.id || version.versionNumber}
                className={`relative flex items-start gap-4 p-4 rounded-lg border ${isCurrent
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
              >
                {/* Timeline Line */}
                {index < sortedVersions.length - 1 && (
                  <div style={{ backgroundColor: 'var(--color-border)' }} className="absolute left-6 top-12 bottom-0 w-0.5" />
                )}

                {/* Version Badge */}
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isCurrent
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                  <span className="text-xs font-medium">v{version.versionNumber}</span>
                </div>

                {/* Version Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Version {version.versionNumber}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(version.uploadDate)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Uploaded by {version.uploadedBy || version.author || 'Unknown'}
                  </div>

                  {version.checksum && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                      Checksum: {version.checksum.slice(0, 16)}...
                    </div>
                  )}

                  {/* Actions */}
                  {!isCurrent && (
                    <div className="flex items-center gap-2">
                      {onRestore && (
                        <button
                          onClick={() => onRestore(version.versionNumber)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Restore
                        </button>
                      )}
                      {onCompare && currentVersion && (
                        <button
                          onClick={() => onCompare(currentVersion, version.versionNumber)}
                          style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-text)' }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Compare
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

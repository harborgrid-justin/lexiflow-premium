import React, { useState, useEffect } from 'react';
import {
  Clock,
  GitBranch,
  User,
  Download,
  RotateCcw,
  Eye,
  GitCompare,
  CheckCircle,
  Circle,
  Tag,
} from 'lucide-react';
import { DocumentVersion } from '../types';
import { format } from 'date-fns';

interface VersionHistoryProps {
  documentId: string;
  onVersionRestore?: (versionId: string) => Promise<void>;
  onVersionCompare?: (versionId1: string, versionId2: string) => void;
  onVersionPreview?: (versionId: string) => void;
  onVersionPublish?: (versionId: string) => Promise<void>;
}

/**
 * VersionHistory Component
 *
 * Displays complete version history timeline:
 * - Chronological version list
 * - Version metadata and changes
 * - Restore to previous version
 * - Compare versions
 * - Publish versions
 * - Download version snapshots
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  onVersionRestore,
  onVersionCompare,
  onVersionPreview,
  onVersionPublish,
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVersionHistory();
  }, [documentId]);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockVersions: DocumentVersion[] = [
        {
          id: 'v-3',
          documentId,
          versionNumber: 3,
          versionTag: '1.2.0',
          contentHash: 'abc123def456',
          fileSize: 524288,
          mimeType: 'application/pdf',
          changes: {
            summary: 'Updated exhibits section',
            linesAdded: 45,
            linesRemoved: 12,
            modified: ['Exhibits', 'Conclusion'],
          },
          authorId: 'user-1',
          author: {
            id: 'user-1',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          commitMessage: 'Added new exhibits and updated conclusion',
          versionType: 'minor',
          isPublished: true,
          publishedAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'v-2',
          documentId,
          versionNumber: 2,
          versionTag: '1.1.0',
          contentHash: 'def789ghi012',
          fileSize: 512000,
          mimeType: 'application/pdf',
          changes: {
            summary: 'Corrected factual errors',
            linesAdded: 8,
            linesRemoved: 15,
            modified: ['Facts', 'Background'],
          },
          authorId: 'user-2',
          author: {
            id: 'user-2',
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          },
          commitMessage: 'Fixed typos and corrected dates',
          versionType: 'patch',
          isPublished: false,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        },
        {
          id: 'v-1',
          documentId,
          versionNumber: 1,
          versionTag: '1.0.0',
          contentHash: 'ghi345jkl678',
          fileSize: 480000,
          mimeType: 'application/pdf',
          changes: {
            summary: 'Initial version',
          },
          authorId: 'user-1',
          author: {
            id: 'user-1',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          commitMessage: 'Initial draft of complaint',
          versionType: 'major',
          isPublished: true,
          publishedAt: new Date('2024-01-05'),
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
        },
      ];

      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        // Limit to 2 selections for comparison
        if (next.size >= 2) {
          next.clear();
        }
        next.add(versionId);
      }
      return next;
    });
  };

  const handleCompareClick = () => {
    if (selectedVersions.size === 2) {
      const [v1, v2] = Array.from(selectedVersions);
      onVersionCompare?.(v1, v2);
    }
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'patch':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Version History</h2>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
            {versions.length} versions
          </span>
        </div>

        {selectedVersions.size === 2 && (
          <button
            onClick={handleCompareClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Compare Selected
          </button>
        )}
      </div>

      {/* Version timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <GitBranch className="w-16 h-16 mb-2" />
            <p>No version history</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Version items */}
            <div className="space-y-6">
              {versions.map((version, index) => (
                <div key={version.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-6 top-2 w-4 h-4 rounded-full border-2 ${
                      index === 0
                        ? 'bg-blue-600 border-blue-600'
                        : version.isPublished
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                  />

                  {/* Version card */}
                  <div
                    className={`relative rounded-lg border ${
                      selectedVersions.has(version.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } transition-colors`}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedVersions.has(version.id)}
                            onChange={() => handleVersionSelect(version.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                Version {version.versionNumber}
                              </span>
                              {version.versionTag && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                                  <Tag className="w-3 h-3" />
                                  {version.versionTag}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getVersionTypeColor(
                                  version.versionType
                                )}`}
                              >
                                {version.versionType}
                              </span>
                              {version.isPublished && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Published
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          {format(version.createdAt, 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>

                      {/* Commit message */}
                      {version.commitMessage && (
                        <p className="text-sm mb-2">{version.commitMessage}</p>
                      )}

                      {/* Author and changes */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.author?.firstName} {version.author?.lastName}
                        </div>
                        {version.fileSize && (
                          <span>{formatFileSize(version.fileSize)}</span>
                        )}
                      </div>

                      {/* Changes summary */}
                      {version.changes && (
                        <div className="mb-2">
                          {version.changes.summary && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              {version.changes.summary}
                            </p>
                          )}
                          {(version.changes.linesAdded !== undefined ||
                            version.changes.linesRemoved !== undefined) && (
                            <div className="flex items-center gap-3 text-xs">
                              {version.changes.linesAdded !== undefined && (
                                <span className="text-green-600 dark:text-green-400">
                                  +{version.changes.linesAdded} lines
                                </span>
                              )}
                              {version.changes.linesRemoved !== undefined && (
                                <span className="text-red-600 dark:text-red-400">
                                  -{version.changes.linesRemoved} lines
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => onVersionPreview?.(version.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            /* Download version */
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        {index !== 0 && onVersionRestore && (
                          <button
                            onClick={() => onVersionRestore(version.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                        {!version.isPublished && onVersionPublish && (
                          <button
                            onClick={() => onVersionPublish(version.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;

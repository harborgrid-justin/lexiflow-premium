/**
 * MetadataPanel Component
 * Display and edit document metadata, tags, and custom fields
 */

import { useState } from 'react';

import { formatDate } from '@/utils/formatters';

import type { LegalDocument } from '@/types/documents';

interface MetadataPanelProps {
  document: LegalDocument;
  editable?: boolean;
  onUpdate?: (metadata: Partial<LegalDocument>) => void;
}

export function MetadataPanel({ document, editable = false, onUpdate }: MetadataPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([...document.tags]);
  const [newTag, setNewTag] = useState('');
  const [editedStatus, setEditedStatus] = useState(document.status || 'Draft');

  const handleSave = () => {
    onUpdate?.({
      tags: editedTags,
      status: editedStatus,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTags([...document.tags]);
    setEditedStatus(document.status || 'Draft');
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditedTags(editedTags.filter(t => t !== tag));
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Metadata
        </h3>
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          {isEditing ? (
            <select
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Final">Final</option>
              <option value="Filed">Filed</option>
              <option value="Signed">Signed</option>
            </select>
          ) : (
            <span style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium">
              {document.status || 'Unknown'}
            </span>
          )}
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <p className="text-sm text-gray-900 dark:text-gray-100">{document.type}</p>
        </div>

        {/* File Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Size
          </label>
          <p className="text-sm text-gray-900 dark:text-gray-100">{document.fileSize || 'Unknown'}</p>
        </div>

        {/* Pages */}
        {document.pageCount && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pages
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{document.pageCount}</p>
          </div>
        )}

        {/* Created Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created
          </label>
          <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(document.uploadDate)}</p>
        </div>

        {/* Modified Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Modified
          </label>
          <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(document.lastModified)}</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          {isEditing ? (
            <>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                  className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addTag}
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                  className="px-3 py-1.5 text-sm rounded-md hover:opacity-80"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {document.tags.length > 0 ? (
                document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No tags</p>
              )}
            </div>
          )}
        </div>

        {/* Case Association */}
        {document.caseId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Case
            </label>
            <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              {document.caseId}
            </p>
          </div>
        )}

        {/* Bates Number */}
        {document.customFields?.batesNumber && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bates Number
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
              {document.customFields.batesNumber as string}
            </p>
          </div>
        )}

        {/* Privilege Status */}
        {document.isRedacted && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                Privileged Document
              </span>
            </div>
          </div>
        )}

        {/* OCR Status */}
        {document.ocrProcessed && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  OCR Processed
                </span>
                {document.ocrProcessedAt && (
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {formatDate(document.ocrProcessedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {document.customFields && Object.keys(document.customFields).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Fields
            </label>
            <div className="space-y-2">
              {Object.entries(document.customFields).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-text)' }}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

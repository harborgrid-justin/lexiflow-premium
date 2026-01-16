/**
 * DocumentAnnotations Component
 * Manage annotations, notes, and comments on documents
 */

import { useTheme } from "@/hooks/useTheme";
import { formatDate } from '@/utils/formatters';
import { useDocumentAnnotations } from '../hooks/useDocumentAnnotations';
import { DocumentAnnotationsProps } from '../types/DocumentAnnotationsProps';

export function DocumentAnnotations({
  documentId,
  annotations,
  onAdd,
  onDelete,
  currentPage = 1
}: DocumentAnnotationsProps) {
  const { tokens } = useTheme();

  const {
    isAdding,
    setIsAdding,
    newAnnotation,
    setNewAnnotation,
    filteredAnnotations,
    handleAdd,
    colors
  } = useDocumentAnnotations({
    documentId,
    annotations,
    onAdd,
    currentPage
  });

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.borderRadius.lg
      }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 style={{ color: tokens.colors.text }} className="text-lg font-medium">
          Annotations
          {currentPage && (
            <span style={{ color: tokens.colors.textMuted }} className="ml-2 text-sm font-normal">
              (Page {currentPage})
            </span>
          )}
        </h3>
        {onAdd && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              backgroundColor: `${tokens.colors.info}10`,
              color: tokens.colors.info,
              borderRadius: tokens.borderRadius.md
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>
        )}
      </div>

      {/* Add Annotation Form */}
      {isAdding && (
        <div
          style={{
            backgroundColor: tokens.colors.surfaceHover,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.borderRadius.lg
          }}
          className="mb-6 p-4"
        >
          <div className="space-y-3">
            <div>
              <label style={{ color: tokens.colors.text }} className="block text-sm font-medium mb-1">
                Note
              </label>
              <textarea
                value={newAnnotation.text}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                rows={3}
                placeholder="Enter your annotation..."
                style={{
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.text,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.borderRadius.md
                }}
                className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label style={{ color: tokens.colors.text }} className="block text-sm font-medium mb-1">
                  Page
                </label>
                <input
                  type="number"
                  value={newAnnotation.page}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, page: parseInt(e.target.value) || 1 })}
                  min="1"
                  style={{
                    backgroundColor: tokens.colors.surface,
                    color: tokens.colors.text,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: tokens.borderRadius.md
                  }}
                  className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label style={{ color: tokens.colors.text }} className="block text-sm font-medium mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewAnnotation({ ...newAnnotation, color: color.value })}
                      style={{
                        backgroundColor: color.value,
                        border: `2px solid ${newAnnotation.color === color.value ? tokens.colors.text : tokens.colors.border}`,
                        transform: newAnnotation.color === color.value ? 'scale(1.1)' : 'scale(1)',
                        borderRadius: tokens.borderRadius.full
                      }}
                      className="w-8 h-8"
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                style={{
                  backgroundColor: tokens.colors.primary,
                  color: '#ffffff',
                  borderRadius: tokens.borderRadius.md
                }}
                className="flex-1 px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Add Annotation
              </button>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  backgroundColor: tokens.colors.surfaceHover,
                  color: tokens.colors.text,
                  borderRadius: tokens.borderRadius.md
                }}
                className="flex-1 px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annotations List */}
      <div className="space-y-3">
        {filteredAnnotations.length === 0 ? (
          <div style={{ color: tokens.colors.textMuted }} className="text-center py-8">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p>No annotations yet</p>
            <p className="text-sm mt-1">Add notes to help with document review</p>
          </div>
        ) : (
          filteredAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              style={{
                backgroundColor: tokens.colors.surfaceHover,
                borderLeft: `4px solid ${annotation.color || tokens.colors.textMuted}`,
                borderRadius: tokens.borderRadius.lg
              }}
              className="p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: tokens.colors.text }} className="text-sm font-medium">
                    {annotation.author}
                  </span>
                  <span style={{ color: tokens.colors.textMuted }} className="text-xs">
                    Page {annotation.page}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: tokens.colors.textMuted }} className="text-xs">
                    {formatDate(annotation.createdAt)}
                  </span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(annotation.id)}
                      style={{ color: tokens.colors.textMuted }}
                      className="hover:opacity-75"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: tokens.colors.textSecondary }} className="text-sm whitespace-pre-wrap">
                {annotation.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

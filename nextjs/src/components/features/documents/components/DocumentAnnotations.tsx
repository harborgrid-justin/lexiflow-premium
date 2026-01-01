/**
 * DocumentAnnotations Component
 * Manage annotations, notes, and comments on documents
 */

import { useState } from 'react';
import { formatDate } from '@/utils/formatters';

export interface Annotation {
  id: string;
  documentId: string;
  page: number;
  text: string;
  author: string;
  createdAt: string;
  x?: number;
  y?: number;
  color?: string;
}

interface DocumentAnnotationsProps {
  documentId: string;
  annotations: Annotation[];
  onAdd?: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  currentPage?: number;
}

export function DocumentAnnotations({
  documentId,
  annotations,
  onAdd,
  onDelete,
  currentPage = 1
}: DocumentAnnotationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    page: currentPage,
    text: '',
    author: 'Current User',
    color: '#FCD34D'
  });

  const filteredAnnotations = currentPage
    ? annotations.filter(a => a.page === currentPage)
    : annotations;

  const handleAdd = () => {
    if (newAnnotation.text.trim()) {
      onAdd?.({
        documentId,
        page: newAnnotation.page,
        text: newAnnotation.text,
        author: newAnnotation.author,
        color: newAnnotation.color
      });
      setNewAnnotation({ page: currentPage, text: '', author: 'Current User', color: '#FCD34D' });
      setIsAdding(false);
    }
  };

  const colors = [
    { value: '#FCD34D', name: 'Yellow' },
    { value: '#34D399', name: 'Green' },
    { value: '#60A5FA', name: 'Blue' },
    { value: '#F87171', name: 'Red' },
    { value: '#A78BFA', name: 'Purple' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Annotations
          {currentPage && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              (Page {currentPage})
            </span>
          )}
        </h3>
        {onAdd && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
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
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <textarea
                value={newAnnotation.text}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                rows={3}
                placeholder="Enter your annotation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Page
                </label>
                <input
                  type="number"
                  value={newAnnotation.page}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, page: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewAnnotation({ ...newAnnotation, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newAnnotation.color === color.value
                          ? 'border-gray-900 dark:border-gray-100 scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Annotation
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4"
              style={{ borderLeftColor: annotation.color || '#9CA3AF' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {annotation.author}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {annotation.page}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(annotation.createdAt)}
                  </span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(annotation.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {annotation.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Download, Eye, Trash2, MoreVertical, Grid, List } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
  pageCount?: number;
  wordCount?: number;
  status: string;
}

interface DocumentListProps {
  documents: Document[];
  viewMode?: 'grid' | 'list';
  onDocumentClick?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onView?: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  viewMode = 'grid',
  onDocumentClick,
  onDownload,
  onDelete,
  onView,
}) => {
  const [view, setView] = useState<'grid' | 'list'>(viewMode);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    return '📎';
  };

  const toggleSelect = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  if (view === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedDocs.has(doc.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onDocumentClick?.(doc)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-4xl">{getFileIcon(doc.mimeType)}</div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(doc);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload?.(doc);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(doc);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-sm mb-1 truncate" title={doc.title}>
                {doc.title}
              </h3>

              <div className="text-xs text-gray-500 space-y-1">
                <div>{formatFileSize(doc.fileSize)}</div>
                <div>{formatDate(doc.createdAt)}</div>
                {doc.pageCount && <div>{doc.pageCount} pages</div>}
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      +{doc.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Modified
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedDocs.has(doc.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onDocumentClick?.(doc)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(doc.mimeType)}</div>
                    <div>
                      <div className="font-medium text-sm">{doc.title}</div>
                      {doc.author && (
                        <div className="text-xs text-gray-500">by {doc.author}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {doc.type}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatFileSize(doc.fileSize)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(doc.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(doc);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.(doc);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(doc);
                      }}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;

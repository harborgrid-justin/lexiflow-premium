import React, { useState, useCallback, useEffect, DragEvent } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { DocumentNode } from '../types';

interface DocumentExplorerProps {
  caseId?: string;
  onDocumentSelect?: (documentId: string) => void;
  onDocumentUpload?: (files: File[], parentId?: string) => Promise<void>;
  onDocumentMove?: (documentId: string, targetFolderId: string) => Promise<void>;
  onDocumentDelete?: (documentId: string) => Promise<void>;
}

/**
 * DocumentExplorer Component
 *
 * Enterprise file tree with drag-drop functionality:
 * - Hierarchical folder/file structure
 * - Drag and drop to move files
 * - File upload via drag-drop or click
 * - Context menu for file operations
 * - Search and filter
 * - Bulk operations
 */
export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  caseId,
  onDocumentSelect,
  onDocumentUpload,
  onDocumentMove,
  onDocumentDelete,
}) => {
  const [documents, setDocuments] = useState<DocumentNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockDocuments: DocumentNode[] = [
        {
          id: 'folder-1',
          name: 'Pleadings',
          type: 'folder',
          path: '/pleadings',
          modifiedAt: new Date(),
          children: [
            {
              id: 'doc-1',
              name: 'Complaint.pdf',
              type: 'file',
              mimeType: 'application/pdf',
              size: 524288,
              path: '/pleadings/complaint.pdf',
              parentId: 'folder-1',
              modifiedAt: new Date(),
            },
            {
              id: 'doc-2',
              name: 'Answer.docx',
              type: 'file',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              size: 102400,
              path: '/pleadings/answer.docx',
              parentId: 'folder-1',
              modifiedAt: new Date(),
            },
          ],
        },
        {
          id: 'folder-2',
          name: 'Discovery',
          type: 'folder',
          path: '/discovery',
          modifiedAt: new Date(),
          children: [
            {
              id: 'doc-3',
              name: 'Interrogatories.pdf',
              type: 'file',
              mimeType: 'application/pdf',
              size: 256000,
              path: '/discovery/interrogatories.pdf',
              parentId: 'folder-2',
              modifiedAt: new Date(),
            },
          ],
        },
        {
          id: 'doc-4',
          name: 'Case Summary.docx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 51200,
          path: '/case-summary.docx',
          modifiedAt: new Date(),
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Handle drag start
  const handleDragStart = (e: DragEvent<HTMLDivElement>, documentId: string) => {
    setDraggedItem(documentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', documentId);
  };

  // Handle drag over
  const handleDragOver = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(targetId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDropTarget(null);
  };

  // Handle drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem && draggedItem !== targetId && onDocumentMove) {
      try {
        await onDocumentMove(draggedItem, targetId);
        await loadDocuments();
      } catch (error) {
        console.error('Failed to move document:', error);
      }
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  // Handle file upload via drag-drop
  const handleFileDrop = async (e: DragEvent<HTMLDivElement>, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onDocumentUpload) {
      try {
        await onDocumentUpload(files, parentId);
        await loadDocuments();
      } catch (error) {
        console.error('Failed to upload files:', error);
      }
    }

    setDropTarget(null);
  };

  // Handle document selection
  const handleDocumentClick = (documentId: string, isFolder: boolean) => {
    if (isFolder) {
      toggleFolder(documentId);
    } else {
      onDocumentSelect?.(documentId);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="w-4 h-4" />;
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (mimeType.includes('word')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (mimeType.includes('image')) return <FileText className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4" />;
  };

  // Render document node
  const renderNode = (node: DocumentNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedDocuments.has(node.id);
    const isDraggedOver = dropTarget === node.id;
    const isFolder = node.type === 'folder';

    return (
      <div key={node.id} className="select-none">
        <div
          draggable={!isFolder}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => isFolder && handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            if (isFolder) {
              if (e.dataTransfer.files.length > 0) {
                handleFileDrop(e, node.id);
              } else {
                handleDrop(e, node.id);
              }
            }
          }}
          onClick={() => handleDocumentClick(node.id, isFolder)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''}
            ${isDraggedOver ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-500' : ''}
          `}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Expand/collapse icon for folders */}
          {isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Icon */}
          <div className="flex-shrink-0">
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5 text-yellow-500" />
              ) : (
                <Folder className="w-5 h-5 text-yellow-500" />
              )
            ) : (
              getFileIcon(node.mimeType)
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{node.name}</div>
            {!isFolder && node.size && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(node.size)}
              </div>
            )}
          </div>

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Open context menu
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Render children */}
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter documents based on search
  const filteredDocuments = searchQuery
    ? documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={loadDocuments}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Document tree */}
      <div
        className="flex-1 overflow-y-auto p-2"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => handleFileDrop(e)}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="w-16 h-16 mb-2" />
            <p>No documents found</p>
            <p className="text-sm mt-1">Drag files here to upload</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDocuments.map((doc) => renderNode(doc))}
          </div>
        )}
      </div>

      {/* Footer with upload button */}
      <div className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0 && onDocumentUpload) {
                onDocumentUpload(files);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default DocumentExplorer;

/**
 * DocumentManagementSystem Component
 *
 * Enterprise document management system with:
 * - Advanced document browser with tree view
 * - Version control with diff viewer
 * - Check-in/check-out system
 * - Document templates
 * - Metadata management
 */

import type { LegalDocument } from '@/types/documents';
import { useState } from 'react';

interface DocumentNode {
  id: string;
  name: string;
  type: 'folder' | 'document';
  children?: DocumentNode[];
  document?: LegalDocument;
  isExpanded?: boolean;
}

interface CheckoutStatus {
  documentId: string;
  checkedOutBy: string;
  checkedOutAt: string;
  isLockedForEditing: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

interface DocumentManagementSystemProps {
  documents: readonly LegalDocument[];
  templates?: DocumentTemplate[];
  checkoutStatus?: CheckoutStatus[];
  currentUserId?: string;
  onDocumentSelect?: (document: LegalDocument) => void;
  onCheckOut?: (documentId: string) => Promise<void>;
  onCheckIn?: (documentId: string, changes: Partial<LegalDocument>) => Promise<void>;
  onCreateFromTemplate?: (templateId: string, data: Record<string, unknown>) => Promise<void>;
  onUpdateMetadata?: (documentId: string, metadata: Record<string, unknown>) => Promise<void>;
}

export function DocumentManagementSystem({
  documents,
  templates = [],
  checkoutStatus = [],
  currentUserId,
  onDocumentSelect,
  onCheckOut,
  onCheckIn,
  onCreateFromTemplate,
}: DocumentManagementSystemProps) {
  const [treeData, setTreeData] = useState<DocumentNode[]>(buildTreeStructure(documents));
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('tree');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Build tree structure from flat document list
  function buildTreeStructure(docs: readonly LegalDocument[]): DocumentNode[] {
    const tree: DocumentNode[] = [];
    const folderMap = new Map<string, DocumentNode>();

    // Group documents by folder/case
    docs.forEach(doc => {
      const folderId = doc.folderId || doc.caseId || 'root';

      if (!folderMap.has(folderId)) {
        const folderNode: DocumentNode = {
          id: folderId,
          name: doc.case?.title || folderId,
          type: 'folder',
          children: [],
          isExpanded: false,
        };
        folderMap.set(folderId, folderNode);
        tree.push(folderNode);
      }

      const folder = folderMap.get(folderId)!;
      folder.children?.push({
        id: doc.id,
        name: doc.title,
        type: 'document',
        document: doc,
      });
    });

    return tree;
  }

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setTreeData(prevTree => {
      const updateNode = (nodes: DocumentNode[]): DocumentNode[] => {
        return nodes.map(node => {
          if (node.id === folderId && node.type === 'folder') {
            return { ...node, isExpanded: !node.isExpanded };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  };

  // Handle document selection
  const handleDocumentClick = (document: LegalDocument) => {
    setSelectedDocument(document);
    onDocumentSelect?.(document);
  };

  // Check if document is checked out
  const isCheckedOut = (documentId: string): CheckoutStatus | undefined => {
    return checkoutStatus.find(s => s.documentId === documentId);
  };

  // Check if current user has checkout
  const hasCheckout = (documentId: string): boolean => {
    const status = isCheckedOut(documentId);
    return status?.checkedOutBy === currentUserId;
  };

  // Handle check-out
  const handleCheckOut = async (documentId: string) => {
    if (isCheckedOut(documentId)) {
      alert('Document is already checked out');
      return;
    }
    await onCheckOut?.(documentId);
  };

  // Handle check-in
  const handleCheckIn = async (documentId: string) => {
    if (!hasCheckout(documentId)) {
      alert('You do not have this document checked out');
      return;
    }
    await onCheckIn?.(documentId, {});
  };

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Render tree node recursively
  const renderTreeNode = (node: DocumentNode, depth: number = 0): JSX.Element => {
    const paddingLeft = depth * 20;

    if (node.type === 'folder') {
      return (
        <div key={node.id}>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${node.isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {node.name}
            </span>
            <span className="text-xs text-gray-500">
              ({node.children?.length || 0})
            </span>
          </div>
          {node.isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Document node
    const doc = node.document!;
    const checkout = isCheckedOut(doc.id);
    const isSelected = selectedDocument?.id === doc.id;

    return (
      <div
        key={node.id}
        className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => handleDocumentClick(doc)}
      >
        <div className="w-4" />
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
          {node.name}
        </span>
        {checkout && (
          <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
        <span className="text-xs text-gray-500">v{doc.currentVersion || 1}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Document Management System
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New from Template
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="Contract">Contracts</option>
            <option value="Pleading">Pleadings</option>
            <option value="Evidence">Evidence</option>
            <option value="Brief">Briefs</option>
            <option value="Correspondence">Correspondence</option>
          </select>

          {/* View Mode Toggles */}
          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 ${viewMode === 'tree' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              title="Tree View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              title="List View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Browser */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-auto">
          {viewMode === 'tree' && (
            <div className="p-2">
              {treeData.map(node => renderTreeNode(node))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map(doc => {
                const checkout = isCheckedOut(doc.id);
                const isSelected = selectedDocument?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.type} • v{doc.currentVersion || 1}
                        </p>
                      </div>
                      {checkout && (
                        <svg className="h-4 w-4 text-orange-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-4 p-4">
              {filteredDocuments.map(doc => {
                const checkout = isCheckedOut(doc.id);
                const isSelected = selectedDocument?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className={`p-4 border rounded-lg cursor-pointer hover:shadow-md ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate w-full">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {doc.type}
                      </p>
                      {checkout && (
                        <div className="mt-2">
                          <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Details Panel */}
        <div className="flex-1 overflow-auto p-6">
          {selectedDocument ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedDocument.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {selectedDocument.type}
                  </span>
                  <span>Version {selectedDocument.currentVersion || 1}</span>
                  {isCheckedOut(selectedDocument.id) && (
                    <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Checked Out
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!isCheckedOut(selectedDocument.id) ? (
                  <button
                    onClick={() => handleCheckOut(selectedDocument.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Check Out
                  </button>
                ) : hasCheckout(selectedDocument.id) ? (
                  <button
                    onClick={() => handleCheckIn(selectedDocument.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Check In
                  </button>
                ) : null}

                <button
                  onClick={() => setShowMetadataEditor(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Metadata
                </button>
              </div>

              {/* Metadata Display */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Document Information
                  </h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">File Size</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedDocument.fileSize || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Pages</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedDocument.pageCount || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Author</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedDocument.author || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Status</dt>
                      <dd>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {selectedDocument.status || 'Draft'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Processing Status
                  </h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">OCR Status</dt>
                      <dd className="text-sm">
                        {selectedDocument.ocrProcessed ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Processed
                          </span>
                        ) : (
                          <span className="text-gray-500">Not processed</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Redacted</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedDocument.isRedacted ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Tags */}
              {selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Template Dialog (placeholder) */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Create Document from Template
            </h3>
            <div className="space-y-3 mb-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    onCreateFromTemplate?.(template.id, {});
                    setShowTemplateDialog(false);
                  }}
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  <span className="text-xs text-gray-500">{template.category}</span>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-center text-gray-500 py-8">No templates available</p>
              )}
            </div>
            <button
              onClick={() => setShowTemplateDialog(false)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Metadata Editor Dialog (placeholder) */}
      {showMetadataEditor && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Edit Metadata
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Metadata editing interface would go here
            </p>
            <button
              onClick={() => setShowMetadataEditor(false)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

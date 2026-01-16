/**
 * Type definitions for useDocumentManager hook
 * @module hooks/useDocumentManager/types
 */

import type { DocumentVersion, LegalDocument } from "@/types";

/**
 * Configuration options for useDocumentManager hook
 */
export interface UseDocumentManagerOptions {
  /** Enable drag-and-drop file upload functionality */
  enableDragDrop?: boolean;
}

/**
 * Document statistics interface
 */
export interface DocumentStats {
  /** Total document count */
  total: number;
  /** Evidence module document count */
  evidence: number;
  /** Discovery module document count */
  discovery: number;
  /** Signed document count */
  signed: number;
}

/**
 * Return type for useDocumentManager hook
 */
export interface UseDocumentManagerReturn {
  /** Filtered documents */
  filtered: LegalDocument[];
  /** Search term */
  searchTerm: string;
  /** Set search term */
  setSearchTerm: (term: string) => void;
  /** Active module filter */
  activeModuleFilter: string;
  /** Set active module filter */
  setActiveModuleFilter: (module: string) => void;
  /** Selected document IDs */
  selectedDocs: string[];
  /** Set selected document IDs */
  setSelectedDocs: (docs: string[]) => void;
  /** Toggle document selection */
  toggleSelection: (id: string) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Selected document for history */
  selectedDocForHistory: LegalDocument | null;
  /** Set selected document for history */
  setSelectedDocForHistory: (doc: LegalDocument | null) => void;
  /** Show version history */
  showVersionHistory: (doc: LegalDocument) => void;
  /** Close version history */
  closeVersionHistory: () => void;
  /** AI processing state */
  isProcessingAI: boolean;
  /** Bulk summarize with AI */
  bulkSummarize: () => Promise<void>;
  /** Current folder */
  currentFolder: string;
  /** Navigate to folder */
  navigateToFolder: (folder: string) => void;
  /** Details panel open */
  isDetailsOpen: boolean;
  /** Toggle details panel */
  toggleDetails: () => void;
  /** Document statistics */
  stats: DocumentStats;
  /** Add tag to document */
  addTag: (docId: string, tag: string) => Promise<void>;
  /** Remove tag from document */
  removeTag: (docId: string, tag: string) => Promise<void>;
  /** Whether searching */
  isSearching: boolean;
  /** Restore document version */
  restoreVersion: (docId: string, versionId: string) => Promise<void>;
  /** All documents (raw) */
  documents: LegalDocument[];
  /** Set documents (legacy compatibility) */
  setDocuments: (
    docs: LegalDocument[] | ((prev: LegalDocument[]) => LegalDocument[])
  ) => void;
  /** Loading state */
  isLoading: boolean;
  /** Restore document version handler */
  handleRestore: (version: DocumentVersion) => Promise<void>;
  /** Bulk AI summarization handler */
  handleBulkSummarize: () => Promise<void>;
  /** All unique tags */
  allTags: string[];
  /** Set current folder */
  setCurrentFolder: (folder: string) => void;
  /** Set details panel open */
  setIsDetailsOpen: (open: boolean) => void;
  /** Preview document */
  previewDoc: LegalDocument | null;
  /** Set preview document */
  setPreviewDoc: (doc: LegalDocument | null) => void;
  /** Update document */
  updateDocument: (id: string, updates: Partial<LegalDocument>) => void;
  /** Drag-drop handlers (if enabled) */
  isDragging?: boolean;
  isUploading?: boolean;
  handleDragEnter?: (e: React.DragEvent) => void;
  handleDragLeave?: (e: React.DragEvent) => void;
  handleDragOver?: (e: React.DragEvent) => void;
  handleDrop?: (e: React.DragEvent) => Promise<void>;
}

/**
 * Document Manager Hook
 * Enterprise-grade React hook for document management with backend API integration
 *
 * @module hooks/useDocumentManager
 * @category Hooks - Document Management
 * @description Manages comprehensive document management operations including:
 * - Worker-based full-text search (non-blocking)
 * - Folder/module-based filtering and navigation
 * - Bulk operations (AI summarization, batch updates)
 * - Tag management with validation
 * - Version history tracking and restoration
 * - Drag-drop upload functionality (optional)
 * - Multi-selection with preview pane
 * - Statistics and analytics
 * - Optimistic UI updates
 *
 * @example
 * ```typescript
 * const docManager = useDocumentManager({ enableDragDrop: true });
 * docManager.setSearchTerm('contract');
 * docManager.toggleSelection('doc-123');
 * ```
 */

import { useCallback, useEffect, useState } from "react";

import { useNotify } from "../useNotify";

import { DEFAULT_FILTERS } from "./constants";
import { useDocumentData } from "./useDocumentData";
import { useDocumentFilters } from "./useDocumentFilters";
import { useDocumentMutations } from "./useDocumentMutations";
import { useDocumentOperations } from "./useDocumentOperations";
import { useDragDropHandlers } from "./useDragDropHandlers";
import { validateDocId } from "./utils";

import type {
  UseDocumentManagerOptions,
  UseDocumentManagerReturn,
} from "./types";
import type { LegalDocument } from "@/types";

export * from "./constants";
export * from "./types";

/**
 * Document manager hook
 * Refactored following the 10-step protocol
 */
export function useDocumentManager(
  options: UseDocumentManagerOptions = {},
): UseDocumentManagerReturn {
  const { enableDragDrop = false } = options;
  const notify = useNotify();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>(
    DEFAULT_FILTERS.MODULE,
  );
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDocForHistory, setSelectedDocForHistory] =
    useState<LegalDocument | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>(
    DEFAULT_FILTERS.FOLDER,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);

  // Data fetching
  const { documents, isLoading } = useDocumentData();

  // Mutations
  const { performUpdate, setDocuments } = useDocumentMutations();

  // Update document handler
  const updateDocument = useCallback(
    (id: string, updates: Partial<LegalDocument>) => {
      if (!validateDocId(id, "updateDocument")) return;

      if (!updates || typeof updates !== "object") {
        console.error(
          "[useDocumentManager.updateDocument] Invalid updates:",
          updates,
        );
        return;
      }

      try {
        if (previewDoc && previewDoc.id === id) {
          setPreviewDoc((prev) => (prev ? { ...prev, ...updates } : null));
        }

        void performUpdate({ id, updates });

        console.warn(`[useDocumentManager] Document updated: ${id}`);
      } catch (error) {
        console.error("[useDocumentManager.updateDocument] Error:", error);
        notify.error("Failed to update document");
      }
    },
    [previewDoc, performUpdate, notify],
  );

  // Filtering
  const { filtered, isSearching, stats, allTags } = useDocumentFilters({
    documents,
    currentFolder,
    activeModuleFilter,
    searchTerm,
  });

  // Operations (tags, versions, bulk)
  const {
    isProcessingAI,
    handleRestore,
    handleBulkSummarize,
    addTag,
    removeTag,
  } = useDocumentOperations({
    documents,
    selectedDocs,
    setSelectedDocs,
    selectedDocForHistory,
    setSelectedDocForHistory,
    updateDocument,
    notify,
  });

  // Selection handlers
  const toggleSelection = useCallback(
    (id: string) => {
      if (!validateDocId(id, "toggleSelection")) return;

      try {
        if (selectedDocs.includes(id)) {
          setSelectedDocs(selectedDocs.filter((d) => d !== id));

          if (previewDoc?.id === id) {
            setPreviewDoc(null);
          }

          console.warn(`[useDocumentManager] Document deselected: ${id}`);
        } else {
          setSelectedDocs([...selectedDocs, id]);

          const doc = documents.find((d) => d.id === id);
          if (doc) {
            setPreviewDoc(doc);
            console.warn(`[useDocumentManager] Document selected: ${id}`);
          }
        }
      } catch (error) {
        console.error("[useDocumentManager.toggleSelection] Error:", error);
      }
    },
    [selectedDocs, previewDoc, documents],
  );

  // Drag & drop handlers
  const dragDropHandlers = useDragDropHandlers({
    enableDragDrop,
    currentFolder,
    notify,
  });

  // Initialization logging
  useEffect(() => {
    console.warn(
      `[useDocumentManager] Initialized with ${
        enableDragDrop ? "drag-drop enabled" : "drag-drop disabled"
      }`,
    );
  }, [enableDragDrop]);

  // Build return object
  const baseReturn = {
    searchTerm,
    setSearchTerm,
    activeModuleFilter,
    setActiveModuleFilter,
    selectedDocs,
    setSelectedDocs,
    toggleSelection,
    clearSelection: useCallback(() => setSelectedDocs([]), []),
    selectedDocForHistory,
    setSelectedDocForHistory,
    showVersionHistory: useCallback(
      (doc: LegalDocument) => setSelectedDocForHistory(doc),
      [],
    ),
    closeVersionHistory: useCallback(() => setSelectedDocForHistory(null), []),
    isProcessingAI,
    bulkSummarize: handleBulkSummarize,
    currentFolder,
    navigateToFolder: useCallback(
      (folder: string) => setCurrentFolder(folder),
      [],
    ),
    isDetailsOpen,
    toggleDetails: useCallback(() => setIsDetailsOpen((prev) => !prev), []),
    stats,
    addTag,
    removeTag,
    isSearching,
    restoreVersion: useCallback(
      async (docId: string, versionId: string) => {
        const doc = documents.find((d) => d.id === docId);
        const version = doc?.versions?.find((v) => v.id === versionId);
        if (version) await handleRestore(version);
      },
      [documents, handleRestore],
    ),
    documents,
    setDocuments,
    isLoading: isLoading || isSearching,
    handleRestore,
    handleBulkSummarize,
    allTags,
    filtered,
    setCurrentFolder,
    setIsDetailsOpen,
    previewDoc,
    setPreviewDoc,
    updateDocument,
  };

  if (enableDragDrop) {
    return {
      ...baseReturn,
      ...dragDropHandlers,
    };
  }

  return baseReturn;
}

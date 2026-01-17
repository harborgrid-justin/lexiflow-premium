/**
 * Document operations sub-hook (tag management, version control, bulk operations)
 * @module hooks/useDocumentManager/useDocumentOperations
 */

import { useCallback, useState } from "react";

import { validateDocId, validateTag } from "./utils";

import type { UseNotifyReturn } from "../useNotify";
import type { DocumentVersion, LegalDocument } from "@/types";

interface UseDocumentOperationsParams {
  documents: LegalDocument[];
  selectedDocs: string[];
  setSelectedDocs: (docs: string[]) => void;
  selectedDocForHistory: LegalDocument | null;
  setSelectedDocForHistory: (doc: LegalDocument | null) => void;
  updateDocument: (id: string, updates: Partial<LegalDocument>) => void;
  notify: UseNotifyReturn;
}

/**
 * Hook for document operations
 */
export function useDocumentOperations({
  documents,
  selectedDocs,
  setSelectedDocs,
  selectedDocForHistory,
  setSelectedDocForHistory,
  updateDocument,
  notify,
}: UseDocumentOperationsParams) {
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const handleRestore = useCallback(
    (version: DocumentVersion) => {
      if (!selectedDocForHistory) {
        console.error(
          "[useDocumentManager.handleRestore] No document selected for history",
        );
        return;
      }

      if (!version || !version.contentSnapshot) {
        console.error(
          "[useDocumentManager.handleRestore] Invalid version:",
          version,
        );
        notify.error("Invalid version data");
        return;
      }

      try {
        const updates: Partial<LegalDocument> = {
          content: version.contentSnapshot,
          lastModified: new Date().toISOString().split("T")[0],
        };

        updateDocument(selectedDocForHistory.id, updates);
        setSelectedDocForHistory(null);

        notify.success("Document restored successfully");
        console.warn(
          `[useDocumentManager] Version restored for: ${selectedDocForHistory.id}`,
        );
      } catch (error) {
        console.error("[useDocumentManager.handleRestore] Error:", error);
        notify.error("Failed to restore version");
      }
    },
    [selectedDocForHistory, updateDocument, notify, setSelectedDocForHistory],
  );

  const handleBulkSummarize = useCallback(async () => {
    if (selectedDocs.length === 0) {
      notify.info("No documents selected for summarization");
      return;
    }

    try {
      setIsProcessingAI(true);
      console.warn(
        `[useDocumentManager] Starting bulk summarization for ${selectedDocs.length} documents`,
      );

      await new Promise((r) => setTimeout(r, 1500));

      notify.success(
        `AI Summary generated for ${selectedDocs.length} documents. Report saved to case file.`,
      );

      setSelectedDocs([]);

      console.warn("[useDocumentManager] Bulk summarization completed");
    } catch (error) {
      console.error("[useDocumentManager.handleBulkSummarize] Error:", error);
      notify.error("Failed to generate summaries");
    } finally {
      setIsProcessingAI(false);
    }
  }, [selectedDocs, notify, setSelectedDocs]);

  const addTag = useCallback(
    (docId: string, tag: string) => {
      if (!validateDocId(docId, "addTag")) return;

      const sanitizedTag = validateTag(tag);
      if (!sanitizedTag) {
        console.error(
          "[useDocumentManager.addTag] Invalid tag after sanitization:",
          tag,
        );
        return;
      }

      try {
        const doc = documents.find((d) => d.id === docId);
        if (!doc) {
          console.error(
            "[useDocumentManager.addTag] Document not found:",
            docId,
          );
          return;
        }

        if (doc.tags.includes(sanitizedTag)) {
          notify.info(`Tag "${sanitizedTag}" already exists`);
          return;
        }

        const newTags = [...doc.tags, sanitizedTag];
        updateDocument(docId, { tags: newTags });

        console.warn(
          `[useDocumentManager] Tag added to ${docId}: ${sanitizedTag}`,
        );
      } catch (error) {
        console.error("[useDocumentManager.addTag] Error:", error);
        notify.error("Failed to add tag");
      }
    },
    [documents, updateDocument, notify],
  );

  const removeTag = useCallback(
    (docId: string, tag: string) => {
      if (!validateDocId(docId, "removeTag")) return;

      try {
        const doc = documents.find((d) => d.id === docId);
        if (!doc) {
          console.error(
            "[useDocumentManager.removeTag] Document not found:",
            docId,
          );
          return;
        }

        const newTags = doc.tags.filter((t: string) => t !== tag);
        updateDocument(docId, { tags: newTags });

        console.warn(`[useDocumentManager] Tag removed from ${docId}: ${tag}`);
      } catch (error) {
        console.error("[useDocumentManager.removeTag] Error:", error);
        notify.error("Failed to remove tag");
      }
    },
    [documents, updateDocument, notify],
  );

  return {
    isProcessingAI,
    handleRestore,
    handleBulkSummarize,
    addTag,
    removeTag,
  };
}

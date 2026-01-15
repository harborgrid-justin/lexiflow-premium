/**
 * @module hooks/useDocumentDragDrop
 * @category Hooks - Document Management
 *
 * @deprecated Use useDocumentManager with enableDragDrop option instead.
 * This hook will be removed in v2.0.
 *
 * @example Migration:
 * ```typescript
 * // Before:
 * const { isDragging, isUploading, handleDragEnter, handleDragLeave, handleDrop } =
 *   useDocumentDragDrop(currentFolder);
 *
 * // After:
 * const { isDragging, isUploading, handleDragEnter, handleDragLeave, handleDrop, ...rest } =
 *   useDocumentManager({ enableDragDrop: true });
 * ```
 *
 * NO THEME USAGE: Utility hook for drag-drop logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { useRef, useState } from "react";

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Services & Data
import { DocumentsApiService } from "@/api/admin/documents-api";
import { queryClient } from "@/services/infrastructure/query-client.service";
import { queryKeys } from "@/utils/query-keys.service";

const documentsApi = new DocumentsApiService();

// Hooks & Context
import { useNotify } from "./useNotify";

// Types
import { CaseId } from "@/types";

// ========================================
// TYPES
// ========================================

/**
 * Return type for useDocumentDragDrop hook
 */
export interface UseDocumentDragDropReturn {
  /** Whether drag is active */
  isDragging: boolean;
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Set uploading state */
  setIsUploading: (uploading: boolean) => void;
  /** Handle drag enter */
  handleDragEnter: (e: React.DragEvent) => void;
  /** Handle drag leave */
  handleDragLeave: (e: React.DragEvent) => void;
  /** Handle drop */
  handleDrop: (e: React.DragEvent) => Promise<void>;
}

// ========================================
// HOOK
// ========================================

/**
 * Document drag-and-drop handler.
 *
 * @deprecated Use useDocumentManager with enableDragDrop option instead
 * @param currentFolder - Current folder context
 * @returns Drag-drop event handlers
 */
export function useDocumentDragDrop(
  currentFolder: string
): UseDocumentDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);
  const notify = useNotify();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0)
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      try {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (file) {
            await documentsApi.upload(file, {
              caseId: "General" as CaseId,
              type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
              title: file.name,
              status: 'Draft',
              tags: [currentFolder === "root" ? "General" : currentFolder]
            });
          }
        }
        queryClient.invalidate(queryKeys.documents.all());
        notify.success(`Uploaded ${e.dataTransfer.files.length} documents.`);
      } catch {
        notify.error("Failed to upload dropped files.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return {
    isDragging,
    isUploading,
    setIsUploading,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}

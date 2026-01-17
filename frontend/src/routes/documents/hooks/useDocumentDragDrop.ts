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
  currentFolder: string,
  uploading?: boolean,
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
import { useMutation } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryClient } from "@/services/infrastructure/query-client.service";
import { queryKeys } from "@/utils/query-keys.service";

// Hooks & Context
import { useNotify } from "@/hooks/useNotify";

// Types

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
  currentFolder: string,
): UseDocumentDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const notify = useNotify();

  // Use standardized useMutation for document upload
  const { mutate: uploadFiles, isLoading: isUploading } = useMutation(
    async (files: File[]) => {
      const results = await Promise.all(
        files.map((file) =>
          DataService.documents.add({
            title: file.name,
            file,
            category: currentFolder || "General",
          }),
        ),
      );
      return results;
    },
    {
      onSuccess: (results) => {
        notify.success(`${results.length} file(s) uploaded successfully`);
        queryClient.invalidate(queryKeys.documents.all());
      },
      onError: (error) => {
        notify.error("Failed to upload files");
        console.error("File upload error:", error);
      },
    },
  );

  const setIsUploading = (_uploading: boolean) => {
    // Provided for backward compatibility
  };

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
      const filesArray = Array.from(e.dataTransfer.files);
      uploadFiles(filesArray);
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

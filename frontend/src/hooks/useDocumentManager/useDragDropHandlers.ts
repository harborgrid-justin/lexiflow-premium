/**
 * Drag and drop handlers sub-hook
 * @module hooks/useDocumentManager/useDragDropHandlers
 */

import { DocumentsApiService } from "@/api/admin/documents-api";
import type { CaseId } from "@/types";

const documentsApi = new DocumentsApiService();
import { queryKeys } from "@/utils/query-keys.service";
import React, { useCallback, useRef, useState } from "react";
import type { UseNotifyReturn } from "../useNotify";
import { queryClient } from "../useQueryHooks";
import { validateFile } from "./utils";

interface UseDragDropHandlersParams {
  enableDragDrop: boolean;
  currentFolder: string;
  notify: UseNotifyReturn;
}

/**
 * Hook for drag-and-drop handlers
 */
export function useDragDropHandlers({
  enableDragDrop,
  currentFolder,
  notify,
}: UseDragDropHandlersParams) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enableDragDrop) return;

      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [enableDragDrop]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enableDragDrop) return;

      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;

      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    },
    [enableDragDrop]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enableDragDrop) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [enableDragDrop]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      if (!enableDragDrop) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

      setIsUploading(true);
      const files = Array.from(e.dataTransfer.files);
      let successCount = 0;
      let failCount = 0;

      try {
        console.log(
          `[useDocumentManager] Processing ${files.length} dropped files`
        );

        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            if (validation.error) {
              notify.error(validation.error);
            }
            failCount++;
            continue;
          }

          try {
            await documentsApi.upload(file, {
              caseId: "General" as CaseId,
              type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
              title: file.name,
              status: 'Draft',
              tags: [currentFolder === "root" ? "General" : currentFolder]
            });
            successCount++;
          } catch (error) {
            console.error(
              `[useDocumentManager] Failed to upload ${file.name}:`,
              error
            );
            failCount++;
          }
        }

        queryClient.invalidate(queryKeys.documents.all());

        if (successCount > 0) {
          notify.success(
            `Uploaded ${successCount} document${successCount > 1 ? "s" : ""}`
          );
        }
        if (failCount > 0) {
          notify.error(
            `Failed to upload ${failCount} document${failCount > 1 ? "s" : ""}`
          );
        }

        console.log(
          `[useDocumentManager] Upload completed: ${successCount} success, ${failCount} failed`
        );
      } catch (error) {
        console.error(
          "[useDocumentManager.handleDrop] Unexpected error:",
          error
        );
        notify.error("Failed to process dropped files");
      } finally {
        setIsUploading(false);
      }
    },
    [enableDragDrop, currentFolder, notify]
  );

  if (!enableDragDrop) {
    return {
      isDragging: undefined,
      isUploading: undefined,
      handleDragEnter: undefined,
      handleDragLeave: undefined,
      handleDragOver: undefined,
      handleDrop: undefined,
    };
  }

  return {
    isDragging,
    isUploading,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}

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
import React, { useState, useRef } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Services & Data
import { DocumentService } from '../services/features/documents/documentService';
import { queryClient } from '../services/infrastructure/queryClient';
import { STORES } from '../services/data/db';

// Hooks & Context
import { useNotify } from './useNotify';

// Types
import { CaseId } from '../types';

// ========================================
// HOOK
// ========================================
export const useDocumentDragDrop = (currentFolder: string) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const dragCounter = useRef(0);
    const notify = useNotify();

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
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
                    await DocumentService.uploadDocument(e.dataTransfer.files[i], {
                        sourceModule: currentFolder === 'root' ? 'General' : currentFolder as any,
                        caseId: 'General' as CaseId
                    });
                }
                queryClient.invalidate([STORES.DOCUMENTS, 'all']);
                notify.success(`Uploaded ${e.dataTransfer.files.length} documents.`);
             } catch (error) {
                 notify.error("Failed to upload dropped files.");
             } finally {
                 setIsUploading(false);
             }
        }
    };

    return { isDragging, isUploading, setIsUploading, handleDragEnter, handleDragLeave, handleDrop };
};


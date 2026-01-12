import { useState, useRef, useCallback } from 'react';
import type { CaseId } from '@/types/primitives';

export interface UploadMetadata {
  caseId?: CaseId;
  type: string;
  tags: string[];
  description?: string;
  status: string;
}

interface UseDocumentUploadProps {
  caseId?: CaseId;
  multiple?: boolean;
  onUpload: (files: File[], metadata: UploadMetadata) => Promise<void>;
}

export function useDocumentUpload({ caseId, multiple = true, onUpload }: UseDocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState<UploadMetadata>({
    caseId,
    type: 'Document',
    tags: [],
    status: 'Draft'
  });
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => multiple ? [...prev, ...droppedFiles] : droppedFiles.slice(0, 1));
  }, [multiple]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => multiple ? [...prev, ...selectedFiles] : selectedFiles.slice(0, 1));
    }
  }, [multiple]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setMetadata(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files, metadata);
      setFiles([]);
      setMetadata({ caseId, type: 'Document', tags: [], status: 'Draft' });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    files,
    isDragging,
    uploading,
    metadata,
    newTag,
    setNewTag,
    setMetadata,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    addTag,
    removeTag,
    handleUpload,
    formatFileSize,
    triggerFileInput
  };
}

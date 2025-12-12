import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Image, File } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
  preview?: string;
}

interface DocumentUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  enableChunking?: boolean;
  chunkSize?: number;
}

/**
 * Enterprise Document Uploader Component
 * Features:
 * - Drag and drop multi-file upload
 * - Progress tracking for each file
 * - Chunked upload for large files
 * - File type validation
 * - Preview generation
 * - Retry failed uploads
 * - Cancel ongoing uploads
 */
export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  onError,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  maxFiles = 10,
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'text/plain',
  ],
  enableChunking = true,
  chunkSize = 5 * 1024 * 1024, // 5MB chunks
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadFile[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Validate file size
        if (file.size > maxFileSize) {
          onError?.(`File ${file.name} exceeds maximum size of ${formatBytes(maxFileSize)}`);
          continue;
        }

        // Validate file type
        if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
          onError?.(`File type ${file.type} not supported for ${file.name}`);
          continue;
        }

        // Check max files limit
        if (files.length + newFiles.length >= maxFiles) {
          onError?.(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const uploadFile: UploadFile = {
          id: `${Date.now()}-${i}`,
          file,
          progress: 0,
          status: 'pending',
        };

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadFile.preview = e.target?.result as string;
            setFiles((prev) => [...prev]);
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(uploadFile);
      }

      setFiles((prev) => [...prev, ...newFiles]);

      // Auto-start upload
      newFiles.forEach((uploadFile) => {
        uploadFile.file.size > chunkSize && enableChunking
          ? uploadChunked(uploadFile)
          : uploadFile.file;
      });
    },
    [files, maxFiles, maxFileSize, acceptedTypes, onError, enableChunking, chunkSize],
  );

  /**
   * Upload file with chunking for large files
   */
  const uploadChunked = async (uploadFile: UploadFile) => {
    const abortController = new AbortController();
    abortControllersRef.current.set(uploadFile.id, abortController);

    try {
      updateFileStatus(uploadFile.id, 'uploading', 0);

      const file = uploadFile.file;
      const totalChunks = Math.ceil(file.size / chunkSize);

      // Initiate chunked upload
      const initResponse = await fetch('/api/documents/upload/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          totalSize: file.size,
          chunkSize,
        }),
        signal: abortController.signal,
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initiate upload');
      }

      const { uploadId } = await initResponse.json();

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('uploadId', uploadId);

        const chunkResponse = await fetch('/api/documents/upload/chunk', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        if (!chunkResponse.ok) {
          throw new Error(`Failed to upload chunk ${chunkIndex}`);
        }

        const progress = ((chunkIndex + 1) / totalChunks) * 80; // 80% for upload
        updateFileStatus(uploadFile.id, 'uploading', progress);
      }

      // Complete upload
      updateFileStatus(uploadFile.id, 'processing', 85);

      const completeResponse = await fetch('/api/documents/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
        signal: abortController.signal,
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const result = await completeResponse.json();

      updateFileStatus(uploadFile.id, 'completed', 100, result.documentId);

      onUploadComplete?.([uploadFile]);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        updateFileStatus(uploadFile.id, 'error', 0, undefined, 'Upload cancelled');
      } else {
        updateFileStatus(uploadFile.id, 'error', 0, undefined, error.message);
        onError?.(error.message);
      }
    } finally {
      abortControllersRef.current.delete(uploadFile.id);
    }
  };

  /**
   * Update file status
   */
  const updateFileStatus = (
    id: string,
    status: UploadFile['status'],
    progress?: number,
    documentId?: string,
    error?: string,
  ) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              progress: progress !== undefined ? progress : f.progress,
              documentId: documentId || f.documentId,
              error: error || f.error,
            }
          : f,
      ),
    );
  };

  /**
   * Cancel upload
   */
  const cancelUpload = (id: string) => {
    const controller = abortControllersRef.current.get(id);
    controller?.abort();
    abortControllersRef.current.delete(id);
  };

  /**
   * Remove file from list
   */
  const removeFile = (id: string) => {
    cancelUpload(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  /**
   * Retry failed upload
   */
  const retryUpload = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      uploadChunked(file);
    }
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  /**
   * Format bytes for display
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get file icon
   */
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Maximum file size: {formatBytes(maxFileSize)} • Maximum {maxFiles} files
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supported: PDF, Word, Images (JPEG, PNG, TIFF), Text
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">
            Uploading {files.length} file{files.length > 1 ? 's' : ''}
          </h3>

          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex items-start space-x-3">
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt={uploadFile.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                      {getFileIcon(uploadFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>

                    {/* Status Icon */}
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {formatBytes(uploadFile.file.size)}
                    {uploadFile.status === 'completed' && uploadFile.documentId && (
                      <span className="ml-2">• ID: {uploadFile.documentId}</span>
                    )}
                  </p>

                  {/* Progress Bar */}
                  {['pending', 'uploading', 'processing'].includes(uploadFile.status) && (
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {uploadFile.status === 'uploading' && 'Uploading...'}
                          {uploadFile.status === 'processing' && 'Processing...'}
                          {uploadFile.status === 'pending' && 'Pending...'}
                        </span>
                        <span>{uploadFile.progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadFile.status === 'error' && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600">{uploadFile.error}</p>
                      <button
                        onClick={() => retryUpload(uploadFile.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            {files.filter((f) => f.status === 'completed').length} of {files.length} completed
          </span>
          <span>
            {files.filter((f) => f.status === 'error').length > 0 &&
              `${files.filter((f) => f.status === 'error').length} failed`}
          </span>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;

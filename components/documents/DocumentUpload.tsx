import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  caseId?: string;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
  onCancel?: () => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

interface UploadedDocument {
  id: string;
  file: File;
  title: string;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  caseId,
  onUploadComplete,
  onCancel,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
  maxFileSize = 50, // 50MB default
  multiple = true,
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not accepted`;
    }

    return null;
  };

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newDocuments: UploadedDocument[] = fileArray.map((file) => {
      const error = validateFile(file);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        title: file.name,
        type: file.type || 'unknown',
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
      };
    });

    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const uploadDocument = async (doc: UploadedDocument) => {
    // Update status to uploading
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id ? { ...d, status: 'uploading', progress: 0 } : d
      )
    );

    // Simulate upload with progress
    const interval = setInterval(() => {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === doc.id && d.progress < 90) {
            return { ...d, progress: d.progress + 10 };
          }
          return d;
        })
      );
    }, 200);

    try {
      // Actual upload logic would go here
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(interval);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, status: 'success', progress: 100 }
            : d
        )
      );
    } catch (error) {
      clearInterval(interval);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, status: 'error', error: 'Upload failed' }
            : d
        )
      );
    }
  };

  const handleUploadAll = async () => {
    const pendingDocs = documents.filter((doc) => doc.status === 'pending');

    for (const doc of pendingDocs) {
      await uploadDocument(doc);
    }

    if (onUploadComplete) {
      const successDocs = documents.filter((doc) => doc.status === 'success');
      onUploadComplete(successDocs);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      default:
        return <FileText className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Upload Documents</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg mb-2">Drag and drop files here</p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <label className="inline-block">
          <input
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
            Browse Files
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-4">
          Accepted formats: {acceptedTypes.join(', ')} (Max {maxFileSize}MB)
        </p>
      </div>

      {/* File List */}
      {documents.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold mb-3">Files ({documents.length})</h3>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="flex-shrink-0">{getStatusIcon(doc.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.title}</p>
                <p className="text-sm text-gray-500">
                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {doc.error && (
                  <p className="text-sm text-red-500">{doc.error}</p>
                )}
                {doc.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${doc.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded"
                disabled={doc.status === 'uploading'}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {documents.length > 0 && (
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAll}
            disabled={documents.every((doc) => doc.status !== 'pending')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload All
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

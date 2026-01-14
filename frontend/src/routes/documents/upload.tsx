/**
 * Document Upload Route
 *
 * Upload wizard for documents with metadata and preview
 *
 * @module routes/documents/upload
 */

import { useTheme } from '@/theme';
import { DataService } from '@/services/data/dataService';
import { useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/upload";
import { DocumentUploader, type UploadMetadata } from './components';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Upload Document',
    description: 'Upload new documents to the system',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function DocumentUploadRoute() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleUpload = async (files: File[], metadata: UploadMetadata) => {
    try {
      // Upload each file
      const uploadPromises = files.map(async (file) => {
        const uploadMetadata = {
          caseId: metadata.caseId,
          type: metadata.type,
          status: metadata.status,
          tags: metadata.tags,
          description: metadata.description,
        };

        return await DataService.documents.upload(file, uploadMetadata);
      });

      await Promise.all(uploadPromises);

      // Navigate back to documents list
      navigate('/documents');
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm mb-4 ${theme.text.secondary} ${theme.primary.hover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documents
        </button>

        <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
          Upload Documents
        </h1>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Upload one or more documents with metadata
        </p>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl">
        <div className={`rounded-lg border p-6 ${theme.surface.default} ${theme.border.default}`}>
          <DocumentUploader
            onUpload={handleUpload}
            onCancel={() => navigate('/documents')}
            multiple={true}
          />
        </div>

        {/* Help Text */}
        <div className={`mt-6 rounded-lg border p-4 ${theme.border.default}`} style={{ backgroundColor: theme.primary.light }}>
          <h4 className={`text-sm font-medium mb-2 ${theme.text.primary}`}>
            Upload Guidelines
          </h4>
          <ul className={`text-sm space-y-1 list-disc list-inside ${theme.text.secondary}`}>
            <li>Maximum file size: 50MB per file</li>
            <li>Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX</li>
            <li>Documents will be automatically scanned for OCR processing</li>
            <li>Add relevant tags to help with document organization and search</li>
            <li>Privileged documents should be marked appropriately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Upload Failed"
      message="We couldn't upload your documents. Please try again."
      backTo="/documents"
      backLabel="Back to Documents"
    />
  );
}

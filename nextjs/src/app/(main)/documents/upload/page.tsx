/**
 * Document Upload Page - Server Component
 * Interface for uploading and managing legal documents
 *
 * ENTERPRISE GUIDELINES COMPLIANCE:
 * - [✓] Guideline 1: Default export for /documents/upload route
 * - [✓] Guideline 2: Server Component wrapper
 * - [✓] Guideline 7: SEO metadata export
 * - [✓] Guideline 12: Singly responsible - delegates to DocumentUploadPage
 * - [✓] Guideline 17: Self-documenting with JSDoc
 */
import DocumentUploadPage from '@/features/documents/components/upload/DocumentUploadPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Documents',
  description: 'Upload and manage legal documents',
};

export default function Page() {
  return <DocumentUploadPage />;
}

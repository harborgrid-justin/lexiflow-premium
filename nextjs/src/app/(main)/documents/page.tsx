/**
 * Documents Page - Server Component
 */
import { DocumentManager } from '@/components/documents/DocumentManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Manage legal documents',
};

export default function DocumentsPage() {
  return (
    <div className="h-full flex flex-col">
      <DocumentManager />
    </div>
  );
}

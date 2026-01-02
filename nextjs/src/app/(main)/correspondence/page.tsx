/**
 * Correspondence Page - Server Component
 */
import CorrespondenceManager from '@/components/correspondence/CorrespondenceManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Correspondence | LexiFlow',
  description: 'Manage legal correspondence',
};

export default function CorrespondencePage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <CorrespondenceManager />
    </div>
  );
}

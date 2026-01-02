/**
 * Docket Page - Server Component
 */
import DocketManager from '@/components/docket/DocketManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docket | LexiFlow',
  description: 'Manage court dockets and filings',
};

export default function DocketPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <DocketManager />
    </div>
  );
}

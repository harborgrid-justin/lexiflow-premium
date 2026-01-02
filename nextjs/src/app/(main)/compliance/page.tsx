import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance | LexiFlow',
  description: 'Risk & Compliance Center',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComplianceDashboard />
    </div>
  );
}

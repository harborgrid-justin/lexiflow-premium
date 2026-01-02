import DafDashboard from '@/components/daf/DafDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAF | LexiFlow',
  description: 'Data Access Framework',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DafDashboard />
    </div>
  );
}

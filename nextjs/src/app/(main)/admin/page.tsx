import AdminPanel from '@/components/admin/AdminPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | LexiFlow',
  description: 'System Administration',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPanel />
    </div>
  );
}

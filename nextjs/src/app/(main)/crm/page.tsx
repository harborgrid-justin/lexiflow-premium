/**
 * CRM Page - Server Component
 */
import ClientCRM from '@/components/crm/ClientCRM';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CRM | LexiFlow',
  description: 'Client Relationship Management',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientCRM />
    </div>
  );
}

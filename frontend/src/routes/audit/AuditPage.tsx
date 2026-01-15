/**
 * Audit Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { AuditProvider } from './AuditProvider';
import { AuditView } from './AuditView';
import type { AuditLoaderData } from './loader';

export function AuditPage() {
  const initialData = useLoaderData() as AuditLoaderData;

  return (
    <AuditProvider initialData={initialData}>
      <AuditView />
    </AuditProvider>
  );
}

export default AuditPage;

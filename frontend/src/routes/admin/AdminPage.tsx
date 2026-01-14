import { useLoaderData } from 'react-router';
import { AdminProvider } from './AdminProvider';
import { AdminView } from './AdminView';
import type { clientLoader } from './loader';

export function AdminPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <AdminProvider initialUsers={data.users} initialSettings={data.settings} initialAuditLogs={data.auditLogs}>
      <AdminView />
    </AdminProvider>
  );
}

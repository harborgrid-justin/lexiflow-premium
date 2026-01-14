import { useLoaderData } from 'react-router';
import { CRMProvider } from './CRMProvider';
import { CRMView } from './CRMView';
import type { clientLoader } from './loader';

export function CRMPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <CRMProvider initialClients={data.clients} initialContacts={data.contacts} initialOpportunities={data.opportunities}>
      <CRMView />
    </CRMProvider>
  );
}

import { useLoaderData } from 'react-router';
import { DiscoveryProvider } from './DiscoveryProvider';
import { DiscoveryView } from './DiscoveryView';
import type { clientLoader } from './loader';

export function DiscoveryPageContent() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <DiscoveryProvider
      initialEvidence={data.evidence}
      initialRequests={data.requests}
      initialProductions={data.productions}
    >
      <DiscoveryView />
    </DiscoveryProvider>
  );
}

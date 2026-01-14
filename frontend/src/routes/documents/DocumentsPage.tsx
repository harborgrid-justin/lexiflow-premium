import { useLoaderData } from 'react-router';
import { DocumentsProvider } from './DocumentsProvider';
import { DocumentsView } from './DocumentsView';
import type { clientLoader } from './loader';

export function DocumentsPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <DocumentsProvider initialDocuments={data.documents}>
      <DocumentsView />
    </DocumentsProvider>
  );
}

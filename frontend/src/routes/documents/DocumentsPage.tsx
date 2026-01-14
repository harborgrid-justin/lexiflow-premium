import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DocumentsProvider } from './DocumentsProvider';
import { DocumentsView } from './DocumentsView';
import type { clientLoader } from './loader';

export function DocumentsPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Documents" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load documents" />}>
        {(resolved) => (
          <DocumentsProvider initialDocuments={resolved.documents}>
            <DocumentsView />
          </DocumentsProvider>
        )}
      </Await>
    </Suspense>
  );
}

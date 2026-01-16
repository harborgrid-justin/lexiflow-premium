/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { CorrespondenceProvider } from './CorrespondenceProvider';
import { CorrespondenceView } from './CorrespondenceView';
import type { clientLoader } from './loader';

export function CorrespondencePageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Correspondence" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load correspondence" />}>
        {(resolved) => (
          <CorrespondenceProvider initialEmails={resolved.emails} initialLetters={resolved.letters} initialTemplates={resolved.templates}>
            <CorrespondenceView />
          </CorrespondenceProvider>
        )}
      </Await>
    </Suspense>
  );
}

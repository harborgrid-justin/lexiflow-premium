/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages & Communication Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { MessagesLoaderData } from './loader';
import { MessagesProvider } from './MessagesProvider';
import { MessagesView } from './MessagesView';

export function MessagesPage() {
  const initialData = useLoaderData() as MessagesLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Messages" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Messages" />}>
        {(resolved) => (
          <MessagesProvider initialData={resolved}>
            <MessagesView />
          </MessagesProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default MessagesPage;

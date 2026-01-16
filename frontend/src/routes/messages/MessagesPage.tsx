/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages Page Component
 *
 * Handles Suspense/Await wiring for messages route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/messages/MessagesPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { MessagesProvider } from './MessagesProvider';
import { MessagesView } from './MessagesView';
import type { MessagesLoaderData } from './loader';

interface MessagesPageProps {
  loaderData: MessagesLoaderData;
}

export function MessagesPage({ loaderData }: MessagesPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Messages" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Messages" />}>
        {(resolved) => (
          <MessagesProvider initialData={resolved}>
            <MessagesView />
          </MessagesProvider>
        )}
      </Await>
    </Suspense>
  );
}

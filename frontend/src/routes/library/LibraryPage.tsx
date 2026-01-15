/**
 * Library Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { LibraryProvider } from './LibraryProvider';
import { LibraryView } from './LibraryView';
import type { LibraryLoaderData } from './loader';

export function LibraryPage() {
  const initialData = useLoaderData() as LibraryLoaderData;

  return (
    <LibraryProvider initialData={initialData}>
      <LibraryView />
    </LibraryProvider>
  );
}

export default LibraryPage;

/**
 * Messages & Communication Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { MessagesLoaderData } from './loader';
import { MessagesProvider } from './MessagesProvider';
import { MessagesView } from './MessagesView';

export function MessagesPage() {
  const initialData = useLoaderData() as MessagesLoaderData;

  return (
    <MessagesProvider initialData={initialData}>
      <MessagesView />
    </MessagesProvider>
  );
}

export default MessagesPage;

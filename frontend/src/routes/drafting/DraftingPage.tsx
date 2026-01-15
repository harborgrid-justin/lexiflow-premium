/**
 * Drafting Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import { DraftingProvider } from './DraftingProvider';
import { DraftingView } from './DraftingView';
import type { DraftingLoaderData } from './loader';

export function DraftingPage() {
  const initialData = useLoaderData() as DraftingLoaderData;

  return (
    <DraftingProvider initialData={initialData}>
      <DraftingView />
    </DraftingProvider>
  );
}

export default DraftingPage;

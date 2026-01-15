/**
 * Legal Research Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { useLoaderData } from 'react-router';
import type { ResearchLoaderData } from './loader';
import { ResearchProvider } from './ResearchProvider';
import { ResearchView } from './ResearchView';

export function ResearchPage() {
  const initialData = useLoaderData() as ResearchLoaderData;

  return (
    <ResearchProvider initialData={initialData}>
      <ResearchView />
    </ResearchProvider>
  );
}

export default ResearchPage;

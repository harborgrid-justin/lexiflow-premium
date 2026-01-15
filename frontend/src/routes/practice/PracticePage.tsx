/**
 * Practice Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { PracticeLoaderData } from './loader';
import { PracticeProvider } from './PracticeProvider';
import { PracticeView } from './PracticeView';

export function PracticePage() {
  const initialData = useLoaderData() as PracticeLoaderData;

  return (
    <PracticeProvider initialData={initialData}>
      <PracticeView />
    </PracticeProvider>
  );
}

export default PracticePage;

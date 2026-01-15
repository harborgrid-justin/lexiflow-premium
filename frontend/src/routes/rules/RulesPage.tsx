/**
 * Rules Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { RulesLoaderData } from './loader';
import { RulesProvider } from './RulesProvider';
import { RulesView } from './RulesView';

export function RulesPage() {
  const initialData = useLoaderData() as RulesLoaderData;

  return (
    <RulesProvider initialData={initialData}>
      <RulesView />
    </RulesProvider>
  );
}

export default RulesPage;

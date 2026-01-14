/**
 * Entities Domain - Page Component
 */

import { EntitiesProvider } from './EntitiesProvider';
import { EntitiesView } from './EntitiesView';

export function EntitiesPage() {
  return (
    <EntitiesProvider>
      <EntitiesView />
    </EntitiesProvider>
  );
}

export default EntitiesPage;

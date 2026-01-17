/**
 * EntitiesPage Component
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * Responsibility: Presentation layer for entity management
 * Pattern: Page → Provider → View
 *
 * This component:
 * - Receives loader data from route index
 * - Provides EntitiesProvider context
 * - Delegates to EntityDirector for UI presentation
 * - Follows separation of concerns principle
 *
 * @see routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { EntityDirector } from './components/EntityDirector';
import { EntitiesProvider } from './EntitiesContext';

import type { clientLoader } from './loader';

interface EntitiesPageProps {
  loaderData: Awaited<ReturnType<typeof clientLoader>>;
}

export function EntitiesPage({ loaderData }: EntitiesPageProps) {
  return (
    <EntitiesProvider initialEntities={loaderData.entities}>
      <EntityDirector />
    </EntitiesProvider>
  );
}

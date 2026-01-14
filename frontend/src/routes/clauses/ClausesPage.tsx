/**
 * Clauses Domain - Page Component
 */

import { ClausesProvider } from './ClausesProvider';
import { ClausesView } from './ClausesView';

export function ClausesPage() {
  return (
    <ClausesProvider>
      <ClausesView />
    </ClausesProvider>
  );
}

export default ClausesPage;

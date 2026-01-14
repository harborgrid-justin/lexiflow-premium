/**
 * Citations Domain - Page Component
 */

import { CitationsProvider } from './CitationsProvider';
import { CitationsView } from './CitationsView';

export function CitationsPage() {
  return (
    <CitationsProvider>
      <CitationsView />
    </CitationsProvider>
  );
}

export default CitationsPage;

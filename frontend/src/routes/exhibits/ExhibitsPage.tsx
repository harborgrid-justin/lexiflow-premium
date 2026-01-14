/**
 * Exhibits Domain - Page Component
 */

import { ExhibitsProvider } from './ExhibitsProvider';
import { ExhibitsView } from './ExhibitsView';

export function ExhibitsPage() {
  return (
    <ExhibitsProvider>
      <ExhibitsView />
    </ExhibitsProvider>
  );
}

export default ExhibitsPage;

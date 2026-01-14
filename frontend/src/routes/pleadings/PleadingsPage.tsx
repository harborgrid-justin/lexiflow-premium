/**
 * Pleadings Domain - Page Component
 */

import { PleadingsProvider } from './PleadingsProvider';
import { PleadingsView } from './PleadingsView';

export function PleadingsPage() {
  return (
    <PleadingsProvider>
      <PleadingsView />
    </PleadingsProvider>
  );
}

export default PleadingsPage;

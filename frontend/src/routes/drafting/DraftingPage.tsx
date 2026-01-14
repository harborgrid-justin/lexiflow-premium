/**
 * Drafting Domain - Page Component
 */

import { DraftingProvider } from './DraftingProvider';
import { DraftingView } from './DraftingView';

export function DraftingPage() {
  return (
    <DraftingProvider>
      <DraftingView />
    </DraftingProvider>
  );
}

export default DraftingPage;

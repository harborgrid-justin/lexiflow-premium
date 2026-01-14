/**
 * Practice Domain - Page Component
 */

import { PracticeProvider } from './PracticeProvider';
import { PracticeView } from './PracticeView';

export function PracticePage() {
  return (
    <PracticeProvider>
      <PracticeView />
    </PracticeProvider>
  );
}

export default PracticePage;

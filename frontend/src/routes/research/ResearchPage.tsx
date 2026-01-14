/**
 * Legal Research Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { ResearchProvider } from './ResearchProvider';
import { ResearchView } from './ResearchView';

export function ResearchPage() {
  return (
    <ResearchProvider>
      <ResearchView />
    </ResearchProvider>
  );
}

export default ResearchPage;

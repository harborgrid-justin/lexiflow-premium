/**
 * Litigation Domain - Page Component
 */

import { LitigationProvider } from './LitigationProvider';
import { LitigationView } from './LitigationView';

export function LitigationPage() {
  return (
    <LitigationProvider>
      <LitigationView />
    </LitigationProvider>
  );
}

export default LitigationPage;

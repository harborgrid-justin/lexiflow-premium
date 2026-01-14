/**
 * Jurisdiction Domain - Page Component
 */

import { JurisdictionProvider } from './JurisdictionProvider';
import { JurisdictionView } from './JurisdictionView';

export function JurisdictionPage() {
  return (
    <JurisdictionProvider>
      <JurisdictionView />
    </JurisdictionProvider>
  );
}

export default JurisdictionPage;

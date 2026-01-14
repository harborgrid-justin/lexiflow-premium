/**
 * Audit Domain - Page Component
 */

import { AuditProvider } from './AuditProvider';
import { AuditView } from './AuditView';

export function AuditPage() {
  return (
    <AuditProvider>
      <AuditView />
    </AuditProvider>
  );
}

export default AuditPage;

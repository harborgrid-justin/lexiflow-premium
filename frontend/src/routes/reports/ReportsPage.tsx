/**
 * Reports & Analytics Domain - Page Component
 */

import { ReportsProvider } from './ReportsProvider';
import { ReportsView } from './ReportsView';

export function ReportsPage() {
  return (
    <ReportsProvider>
      <ReportsView />
    </ReportsProvider>
  );
}

export default ReportsPage;

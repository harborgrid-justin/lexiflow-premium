/**
 * DAF (Document Assembly Framework) Domain - Page Component
 */

import { DAFProvider } from './DAFProvider';
import { DAFView } from './DAFView';

export function DAFPage() {
  return (
    <DAFProvider>
      <DAFView />
    </DAFProvider>
  );
}

export default DAFPage;

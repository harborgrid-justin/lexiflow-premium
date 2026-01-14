/**
 * Rules Domain - Page Component
 */

import { RulesProvider } from './RulesProvider';
import { RulesView } from './RulesView';

export function RulesPage() {
  return (
    <RulesProvider>
      <RulesView />
    </RulesProvider>
  );
}

export default RulesPage;

/**
 * Workflows Domain - Page Component
 * Enterprise React Architecture Pattern
 *
 * Responsibilities:
 * - Route integration (loader)
 * - Provider composition
 * - View rendering
 */

import { WorkflowsProvider } from './WorkflowsProvider';
import { WorkflowsView } from './WorkflowsView';

/**
 * Page Component
 * Composes Provider + View
 */
export function WorkflowsPage() {
  return (
    <WorkflowsProvider>
      <WorkflowsView />
    </WorkflowsProvider>
  );
}

export default WorkflowsPage;

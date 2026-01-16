/**
 * DafPage Component
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * Responsibility: Presentation layer for DAF operations
 * Pattern: Page → View
 *
 * This component:
 * - Receives loader data from route index
 * - Delegates to DafDashboard for UI presentation
 * - Follows separation of concerns principle
 *
 * Note: DAF route uses simple loader pattern (no async Suspense needed)
 * This Page component provides consistency with enterprise architecture
 * even though the data is synchronously available.
 *
 * @see routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { DafDashboard } from './components/DafDashboard';
import type { loader } from './index';

interface DafPageProps {
  loaderData: Awaited<ReturnType<typeof loader>>;
}

export function DafPage({ loaderData }: DafPageProps) {
  return <DafDashboard stats={loaderData.stats} />;
}

/**
 * @module components/enterprise/CRM/ClientAnalytics
 * @category Enterprise CRM
 * @description Client analytics module - Barrel export
 *
 * REFACTORED: 831 LOC -> ~110 LOC (7.5x reduction)
 * Following the 10-step refactoring protocol:
 * [01] Headless hook extraction -> useClientAnalytics.ts
 * [02] Sub-component extraction -> Card components + Tab components
 * [03] Static data isolation -> constants.ts
 * [04] Pure function hoisting -> utils.ts
 * [05] Schema separation -> types.ts
 * [06] Style segregation -> Using Tailwind
 * [07] API abstraction -> Ready for integration
 * [08] Conditional guards -> Moved to parent
 * [09] Event handler composition -> Simplified in hook
 * [10] Component colocation -> Folder structure with barrel export
 */

export { ClientAnalyticsView as ClientAnalytics } from './ClientAnalyticsView';
export type * from './types';

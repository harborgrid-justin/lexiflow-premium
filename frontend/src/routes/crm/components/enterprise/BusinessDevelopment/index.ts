/**
 * @module components/enterprise/CRM/BusinessDevelopment
 * @category Enterprise CRM
 * @description Business development module - Barrel export
 *
 * REFACTORED: 886 LOC -> ~90 LOC (10x reduction)
 * Following the 10-step refactoring protocol:
 * [01] Headless hook extraction -> useBusinessDevelopment.ts
 * [02] Sub-component extraction -> LeadCard, PitchCard, RFPCard, WinLossCard, Tab components
 * [03] Static data isolation -> constants.ts
 * [04] Pure function hoisting -> utils.ts
 * [05] Schema separation -> types.ts
 * [06] Style segregation -> Using Tailwind (no separate styles file needed)
 * [07] API abstraction -> Ready for future integration
 * [08] Conditional guards -> Moved to parent components
 * [09] Event handler composition -> Simplified in hook
 * [10] Component colocation -> Folder structure with barrel export
 */

export { BusinessDevelopmentView as BusinessDevelopment } from "./BusinessDevelopmentView";
export type * from "./types";

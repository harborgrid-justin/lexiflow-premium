/**
 * @module components/organisms/cases
 * @category Organisms - Cases
 * @description Case management UI components for matter lifecycle and task management.
 *
 * CASE COMPONENTS:
 * - DocketSkeleton: Loading skeleton for docket entries
 * - RiskMeter: Visual risk assessment indicator
 * - Kanban: Kanban board for case task management
 * - TimeEntryModal: Time tracking entry form
 * - TaskCreationModal: Task creation dialog
 *
 * USAGE:
 * ```tsx
 * import { RiskMeter, Kanban, TimeEntryModal } from '@/components/organisms/cases';
 * ```
 */

// Re-export from features/cases/components where these components live
export * from '@/components/features/cases/components';

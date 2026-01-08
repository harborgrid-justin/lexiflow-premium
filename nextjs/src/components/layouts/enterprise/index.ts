/**
 * Enterprise Legal Workflow Layouts
 *
 * Production-ready layouts for complex legal workflows built with shadcn/ui.
 * Each layout is fully typed, keyboard-accessible, and optimized for legal professionals.
 */

// Core Generic Layouts (NEW - Production Ready)
export * from "./list-layout"
export * from "./detail-layout"
export * from "./split-view-layout"
export * from "./form-layout"

export { DocumentEditorLayout } from "./document-editor-layout";

export { MatterIntakeLayout, createDefaultIntakeSteps } from "./matter-intake-layout";

export { BillingLayout } from "./billing-layout";

export { WarRoomLayout } from "./war-room-layout";

export { ResearchLayout } from "./research-layout";

// Case Management & Discovery Layouts
export { CaseDetailLayout } from "./case-detail-layout";
export type {
  CaseDetailLayoutProps,
  CaseData,
  CaseStatus,
  CaseKeyDate,
  TeamMember,
  RelatedCase,
  CaseActivity,
  CaseDetailTab,
} from "./case-detail-layout";

export { DiscoveryLayout } from "./discovery-layout";
export type {
  DiscoveryLayoutProps,
  DiscoveryDocument,
  DocumentStatus,
  DiscoveryFilters,
  ViewMode,
} from "./discovery-layout";

export { TimelineLayout } from "./timeline-layout";
export type {
  TimelineLayoutProps,
  TimelineEvent,
  TimelineEventType,
  TimelineFilters,
  TimelineZoomLevel,
} from "./timeline-layout";

export { KanbanLayout } from "./kanban-layout";
export type {
  KanbanLayoutProps,
  KanbanColumn,
  KanbanCard,
  CardPriority,
  KanbanFilters,
} from "./kanban-layout";

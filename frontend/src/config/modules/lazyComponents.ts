import React from "react";
import { lazyWithPreload } from "./lazyWithPreload";

// Dashboard & Core
export const Dashboard = lazyWithPreload(
  () =>
    import("../../routes/dashboard/components/Dashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CaseModule = lazyWithPreload(
  () =>
    import("../../routes/cases/components/list/CaseModule") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const NewCasePage = lazyWithPreload(
  () =>
    import("../../routes/cases/components/create/NewCase") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DocketManager = lazyWithPreload(
  () =>
    import("../../routes/cases/components/docket/DocketManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Case Management Suite
export const CaseOverviewDashboard = lazyWithPreload(
  () =>
    import("../../routes/cases/components/overview/CaseOverviewDashboard").then(
      (m) => ({ default: m.CaseOverviewDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseCalendar = lazyWithPreload(
  () =>
    import("../../routes/cases/components/calendar/CaseCalendar").then((m) => ({
      default: m.CaseCalendar,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseAnalyticsDashboard = lazyWithPreload(
  () =>
    import("../../routes/cases/components/analytics/CaseAnalyticsDashboard").then(
      (m) => ({ default: m.CaseAnalyticsDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const NewCaseIntakeForm = lazyWithPreload(
  () =>
    import("../../routes/cases/components/intake/NewCaseIntakeForm").then(
      (m) => ({ default: m.NewCaseIntakeForm })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseOperationsCenter = lazyWithPreload(
  () =>
    import("../../routes/cases/components/operations/CaseOperationsCenter") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CaseInsightsDashboard = lazyWithPreload(
  () =>
    import("../../routes/cases/components/insights/CaseInsightsDashboard").then(
      (m) => ({ default: m.CaseInsightsDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseFinancialsCenter = lazyWithPreload(
  () =>
    import("../../routes/cases/components/financials/CaseFinancialsCenter").then(
      (m) => ({ default: m.CaseFinancialsCenter })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);

// Operations & Workflow
export const CorrespondenceManager = lazyWithPreload(
  () =>
    import("../../routes/correspondence/components/CorrespondenceManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const MasterWorkflow = lazyWithPreload(
  () =>
    import("../../routes/cases/components/workflow/MasterWorkflow") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DocumentManager = lazyWithPreload(
  () =>
    import("../../routes/documents/components/DocumentManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Litigation
export const WarRoom = lazyWithPreload(
  () =>
    import("../../routes/war-room/components/WarRoom") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ExhibitManager = lazyWithPreload(
  () =>
    import("../../routes/exhibits/components/ExhibitManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DiscoveryPlatform = lazyWithPreload(
  () =>
    import("../../routes/discovery/components/platform/DiscoveryPlatform") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const EvidenceVault = lazyWithPreload(
  () =>
    import("../../routes/evidence/components/EvidenceVault") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const PleadingBuilder = lazyWithPreload(
  () =>
    import("../../routes/pleadings/components/PleadingBuilder") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const LitigationBuilder = lazyWithPreload(
  () =>
    import("../../routes/litigation/components/strategy/LitigationBuilder") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Knowledge & Research
export const ResearchTool = lazyWithPreload(
  () =>
    import("../../routes/research/components/ResearchTool") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const FirmOperations = lazyWithPreload(
  () =>
    import("../../routes/practice/components/FirmOperations") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const JurisdictionManager = lazyWithPreload(
  () =>
    import("../../routes/jurisdiction/components/JurisdictionManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const RulesPlatform = lazyWithPreload(
  () =>
    import("../../routes/rules/components/RulesPlatform") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const KnowledgeBase = lazyWithPreload(
  () =>
    import("../../routes/library/components/KnowledgeBase") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ClauseLibrary = lazyWithPreload(
  () =>
    import("../../routes/clauses/components/ClauseLibrary") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CitationManager = lazyWithPreload(
  () =>
    import("../../routes/citations/components/CitationManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Operations & Billing
export const BillingDashboard = lazyWithPreload(
  () =>
    import("../../routes/billing/components/BillingDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ClientCRM = lazyWithPreload(
  () =>
    import("../../routes/crm/components/ClientCRM") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ComplianceDashboard = lazyWithPreload(
  () =>
    import("../../routes/compliance/components/ComplianceDashboard").then(
      (m) => ({ default: m.ComplianceDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const SecureMessenger = lazyWithPreload(
  () =>
    import("../../routes/messages/components/SecureMessenger") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DafDashboard = lazyWithPreload(
  () =>
    import("../../routes/daf/components/DafDashboard").then((m) => ({
      default: m.DafDashboard,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);

// Admin & Settings
export const AdminPanel = lazyWithPreload(
  () =>
    import("../../routes/admin/components/AdminPanel") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ThemeSettings = lazyWithPreload(
  () =>
    import("../../routes/admin/theme-settings") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const AdminDatabaseControl = lazyWithPreload(
  () =>
    import("../../routes/admin/components/data/AdminDatabaseControl") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const AnalyticsDashboard = lazyWithPreload(
  () =>
    import("../../routes/admin/components/analytics/AnalyticsDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Other
export const EntityDirector = lazyWithPreload(
  () =>
    import("../../routes/cases/components/entities/EntityDirector") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CalendarView = lazyWithPreload(
  () =>
    import("../../routes/cases/components/calendar/CalendarView") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const UserProfileManager = lazyWithPreload(
  () =>
    import("../../routes/profile") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DraftingDashboard = lazyWithPreload(
  () =>
    import("../../routes/drafting/components/DraftingDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

export const ThemeCustomizer = lazyWithPreload(
  () =>
    import("../../theme/components/ThemeCustomizer") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

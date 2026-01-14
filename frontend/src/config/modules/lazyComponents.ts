import React from "react";
import { lazyWithPreload } from "./lazyWithPreload";

// Dashboard & Core
export const Dashboard = lazyWithPreload(
  () =>
    import("../../features/dashboard/components/Dashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CaseModule = lazyWithPreload(
  () =>
    import("@features/cases/components/list/CaseManagement").then((m) => ({
      default: m.CaseManagement,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const NewCasePage = lazyWithPreload(
  () =>
    import("../../features/cases/components/create/NewCase") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DocketManager = lazyWithPreload(
  () =>
    import("../../features/cases/components/docket/DocketManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Case Management Suite
export const CaseOverviewDashboard = lazyWithPreload(
  () =>
    import("../../features/cases/components/overview/CaseOverviewDashboard").then(
      (m) => ({ default: m.CaseOverviewDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseCalendar = lazyWithPreload(
  () =>
    import("../../features/cases/components/calendar/CaseCalendar").then(
      (m) => ({ default: m.CaseCalendar })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseAnalyticsDashboard = lazyWithPreload(
  () =>
    import("../../features/cases/components/analytics/CaseAnalyticsDashboard").then(
      (m) => ({ default: m.CaseAnalyticsDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const NewCaseIntakeForm = lazyWithPreload(
  () =>
    import("../../features/cases/components/intake/NewCaseIntakeForm").then(
      (m) => ({ default: m.NewCaseIntakeForm })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseOperationsCenter = lazyWithPreload(
  () =>
    import("../../features/cases/components/operations/CaseOperationsCenter") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CaseInsightsDashboard = lazyWithPreload(
  () =>
    import("../../features/cases/components/insights/CaseInsightsDashboard").then(
      (m) => ({ default: m.CaseInsightsDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const CaseFinancialsCenter = lazyWithPreload(
  () =>
    import("../../features/cases/components/financials/CaseFinancialsCenter").then(
      (m) => ({ default: m.CaseFinancialsCenter })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);

// Operations & Workflow
export const CorrespondenceManager = lazyWithPreload(
  () =>
    import("../../features/operations/correspondence/CorrespondenceManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const MasterWorkflow = lazyWithPreload(
  () =>
    import("../../features/cases/components/workflow/MasterWorkflow") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DocumentManager = lazyWithPreload(
  () =>
    import("../../features/operations/documents/DocumentManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Litigation
export const WarRoom = lazyWithPreload(
  () =>
    import("../../features/litigation/war-room/WarRoom").then((m) => ({
      default: m.WarRoom,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const ExhibitManager = lazyWithPreload(
  () =>
    import("../../features/litigation/exhibits/ExhibitManager").then((m) => ({
      default: m.ExhibitManager,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const DiscoveryPlatform = lazyWithPreload(
  () =>
    import("../../features/litigation/discovery/DiscoveryPlatform") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const EvidenceVault = lazyWithPreload(
  () =>
    import("../../features/litigation/evidence/EvidenceVault") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const PleadingBuilder = lazyWithPreload(
  () =>
    import("../../features/litigation/pleadings/PleadingBuilder").then((m) => ({
      default: m.PleadingBuilder,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const LitigationBuilder = lazyWithPreload(
  () =>
    import("../../features/litigation/strategy/LitigationBuilder").then(
      (m) => ({ default: m.LitigationBuilder })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);

// Knowledge & Research
export const ResearchTool = lazyWithPreload(
  () =>
    import("../../features/knowledge/research/ResearchTool").then((m) => ({
      default: m.ResearchTool,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const FirmOperations = lazyWithPreload(
  () =>
    import("../../features/knowledge/practice/FirmOperations") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const JurisdictionManager = lazyWithPreload(
  () =>
    import("../../features/knowledge/jurisdiction/JurisdictionManager").then(
      (m) => ({ default: m.JurisdictionManager })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const RulesPlatform = lazyWithPreload(
  () =>
    import("../../features/knowledge/rules/RulesPlatform").then((m) => ({
      default: m.RulesPlatform,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const KnowledgeBase = lazyWithPreload(
  () =>
    import("../../features/knowledge/base/KnowledgeBase").then((m) => ({
      default: m.KnowledgeBase,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);
export const ClauseLibrary = lazyWithPreload(
  () =>
    import("../../features/knowledge/clauses/ClauseLibrary") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CitationManager = lazyWithPreload(
  () =>
    import("../../features/knowledge/citation/CitationManager") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Operations & Billing
export const BillingDashboard = lazyWithPreload(
  () =>
    import("../../features/operations/billing/BillingDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ClientCRM = lazyWithPreload(
  () =>
    import("../../features/operations/crm/ClientCRM") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ComplianceDashboard = lazyWithPreload(
  () =>
    import("../../features/operations/compliance/ComplianceDashboard").then(
      (m) => ({ default: m.ComplianceDashboard })
    ) as Promise<{ default: React.ComponentType<unknown> }>
);
export const SecureMessenger = lazyWithPreload(
  () =>
    import("../../features/operations/messenger/SecureMessenger") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DafDashboard = lazyWithPreload(
  () =>
    import("../../features/operations/daf/DafDashboard").then((m) => ({
      default: m.DafDashboard,
    })) as Promise<{ default: React.ComponentType<unknown> }>
);

// Admin & Settings
export const AdminPanel = lazyWithPreload(
  () =>
    import("../../features/admin/AdminPanel") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const ThemeSettings = lazyWithPreload(
  () =>
    import("../../features/admin/ThemeSettingsPage") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const AdminDatabaseControl = lazyWithPreload(
  () =>
    import("../../features/admin/components/data/AdminDatabaseControl") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const AnalyticsDashboard = lazyWithPreload(
  () =>
    import("../../features/admin/components/analytics/AnalyticsDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

// Other
export const EntityDirector = lazyWithPreload(
  () =>
    import("../../features/cases/components/entities/EntityDirector") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const CalendarView = lazyWithPreload(
  () =>
    import("../../features/cases/components/calendar/CalendarView") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const UserProfileManager = lazyWithPreload(
  () =>
    import("../../routes/profile/index") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);
export const DraftingDashboard = lazyWithPreload(
  () =>
    import("../../features/drafting/DraftingDashboard") as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

export const ThemeCustomizer = lazyWithPreload(
  () =>
    import("../../features/theme/components/ThemeCustomizer").then((m) => ({
      default: m.ThemeCustomizer,
    })) as Promise<{
      default: React.ComponentType<unknown>;
    }>
);

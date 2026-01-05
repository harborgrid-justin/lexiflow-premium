/**
 * React Router v7 Routes Configuration
 *
 * This file defines ALL application routes using the declarative config-based routing.
 * Routes are organized hierarchically and support:
 * - Type-safe params and loaders
 * - Server-side rendering (SSR)
 * - Pre-rendering for static pages
 * - Nested layouts
 * - Error boundaries per route
 *
 * @see https://reactrouter.com/dev/guides/routing
 */

import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // ============================================================================
  // Public Routes (No Authentication Required)
  // ============================================================================

  // Authentication routes (outside main layout)
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("forgot-password", "routes/auth/forgot-password.tsx"),
  route("reset-password", "routes/auth/reset-password.tsx"),

  // ============================================================================
  // Protected Routes (Authentication Required)
  // ============================================================================

  // App layout with authentication, sidebar, and header
  // Note: root.tsx is automatically used by React Router v7 framework mode
  // The layout.tsx loader enforces authentication for all child routes
  layout("routes/layout.tsx", [
    // Home/Dashboard routes
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx"),

    // Case Management - Primary Module
    route("cases", "routes/cases/index.tsx"),
    route("cases/create", "routes/cases/create.tsx"),
    route("cases/:caseId", "routes/cases/case-detail.tsx"),

    // Case Sub-modules (nested under case detail)
    route("cases/:caseId/overview", "routes/cases/overview.tsx"),
    route("cases/:caseId/calendar", "routes/cases/calendar.tsx"),
    route("cases/:caseId/analytics", "routes/cases/analytics.tsx"),
    route("cases/:caseId/operations", "routes/cases/operations.tsx"),
    route("cases/:caseId/insights", "routes/cases/insights.tsx"),
    route("cases/:caseId/financials", "routes/cases/financials.tsx"),

    // Docket & Filings
    route("docket", "routes/docket/index.tsx"),
    route("docket/:docketId", "routes/docket/detail.tsx"),

    // Documents
    route("documents", "routes/documents/index.tsx"),
    route("documents/upload", "routes/documents/upload.tsx"),
    route("documents/:documentId", "routes/documents/detail.tsx"),

    // Correspondence
    route("correspondence", "routes/correspondence/index.tsx"),
    route("correspondence/compose", "routes/correspondence/compose.tsx"),

    // Workflows
    route("workflows", "routes/workflows/index.tsx"),
    route("workflows/:workflowId", "routes/workflows/detail.tsx"),

    // Discovery & Evidence
    route("discovery", "routes/discovery/index.tsx"),
    route("discovery/:discoveryId", "routes/discovery/detail.tsx"),
    route("evidence", "routes/evidence/index.tsx"),
    route("evidence/:evidenceId", "routes/evidence/detail.tsx"),
    route("exhibits", "routes/exhibits/index.tsx"),
    route("exhibits/:exhibitId", "routes/exhibits/detail.tsx"),

    // Research & Citations
    route("research", "routes/research/index.tsx"),
    route("research/:researchId", "routes/research/detail.tsx"),
    route("citations", "routes/citations/index.tsx"),

    // War Room & Trial Prep
    route("war_room", "routes/war-room/index.tsx"),
    route("war_room/:roomId", "routes/war-room/detail.tsx"),

    // Pleadings & Drafting
    route("pleading_builder", "routes/pleading/builder.tsx"),
    route("drafting", "routes/drafting/index.tsx"),
    route("litigation_builder", "routes/litigation/builder.tsx"),

    // Operations & Admin
    route("billing", "routes/billing/index.tsx"),
    route("crm", "routes/crm/index.tsx"),
    route("crm/:clientId", "routes/crm/client-detail.tsx"),
    route("compliance", "routes/compliance/index.tsx"),
    route("practice", "routes/practice/index.tsx"),
    route("daf", "routes/daf/index.tsx"),
    route("entities", "routes/entities/index.tsx"),
    route("data_platform", "routes/data-platform/index.tsx"),
    route("analytics", "routes/analytics/index.tsx"),

    // Knowledge Base
    route("library", "routes/library/index.tsx"),
    route("clauses", "routes/clauses/index.tsx"),
    route("jurisdiction", "routes/jurisdiction/index.tsx"),
    route("rules_engine", "routes/rules/index.tsx"),

    // Calendar & Messaging
    route("calendar", "routes/calendar/index.tsx"),
    route("messages", "routes/messages/index.tsx"),

    // Profile & Settings
    route("profile", "routes/profile/index.tsx"),
    route("settings", "routes/settings/index.tsx"), // Redirects to profile

    // Admin Routes (Admin Only)
    route("admin", "routes/admin/index.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
    route("admin/theme-settings", "routes/admin/theme-settings.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/roles", "routes/admin/roles.tsx"),
    route("admin/permissions", "routes/admin/permissions.tsx"),
    route("admin/audit", "routes/admin/audit.tsx"),
    route("admin/integrations", "routes/admin/integrations.tsx"),
    route("admin/backup", "routes/admin/backup.tsx"),

    // Real Estate Division (nested routes with prefix)
    ...prefix("real_estate", [
      route("portfolio_summary", "routes/real-estate/portfolio-summary.tsx"),
      route("inventory", "routes/real-estate/inventory.tsx"),
      route("utilization", "routes/real-estate/utilization.tsx"),
      route("outgrants", "routes/real-estate/outgrants.tsx"),
      route("solicitations", "routes/real-estate/solicitations.tsx"),
      route("relocation", "routes/real-estate/relocation.tsx"),
      route("cost_share", "routes/real-estate/cost-share.tsx"),
      route("disposal", "routes/real-estate/disposal.tsx"),
      route("acquisition", "routes/real-estate/acquisition.tsx"),
      route("encroachment", "routes/real-estate/encroachment.tsx"),
      route("user_management", "routes/real-estate/user-management.tsx"),
      route("audit_readiness", "routes/real-estate/audit-readiness.tsx"),
    ]),
  ]),

  // ============================================================================
  // Catch-All 404 Route
  // ============================================================================
  // This must be the last route to catch all unmatched paths
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;

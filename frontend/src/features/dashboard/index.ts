/**
 * Dashboard Feature Module
 *
 * Consolidated dashboard domain combining analytics, metrics, and role-based views.
 *
 * @module features/dashboard
 */

// Core dashboard components
export * from "./components/Dashboard";
export * from "./components/DashboardAnalytics";
export * from "./components/DashboardContent";
export * from "./components/DashboardMetrics";
export * from "./components/DashboardOverview";
export * from "./components/DashboardSidebar";
export * from "./components/EnhancedDashboardOverview";
export * from "./components/FinancialPerformance";
export * from "./components/PersonalWorkspace";
export * from "./components/RoleDashboardRouter";

// Dashboard widgets
export * from "./widgets";

// Dashboard pages
export * from "./pages";

// Role-specific dashboards
export * from "./role-dashboards";

// Hooks
export * from "./hooks/useDashboardData";

// Services
export { dashboardService } from "./services/dashboardService";

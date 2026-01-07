/**
 * Route Definitions
 * Central route configuration
 */

export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",

  // Billing feature
  billing: {
    root: "/billing",
    invoices: "/billing/invoices",
    payments: "/billing/payments",
    subscriptions: "/billing/subscriptions",
  },

  // Reporting feature
  reporting: {
    root: "/reporting",
    analytics: "/reporting/analytics",
    exports: "/reporting/exports",
  },

  // Admin feature
  admin: {
    root: "/admin",
    users: "/admin/users",
    settings: "/admin/settings",
    logs: "/admin/logs",
  },

  // Error pages
  unauthorized: "/unauthorized",
  notFound: "/404",
  error: "/error",
} as const;

export type Routes = typeof routes;

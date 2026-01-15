/**
 * ================================================================================
 * LAYOUTS INDEX - LAYOUT COMPONENTS EXPORTS
 * ================================================================================
 *
 * EXPORTS:
 * - RootLayout: Document structure + root providers
 * - AppShellLayout: Authenticated app with sidebar/topbar
 * - PageFrame: Reusable page container
 *
 * @module layouts
 */

export {
  ErrorBoundary as AppShellErrorBoundary,
  default as AppShellLayout,
} from "./AppShellLayout";
export { PageFrame } from "./PageFrame";
export { RootErrorBoundary, RootLayout } from "./RootLayout";

/**
 * @module components/layouts/AppContentRenderer
 * @category Layouts - Application Shell
 * @description Dynamic content renderer for application views with lazy-loaded modules,
 * access control enforcement, case detail routing, and module prop injection.
 * 
 * RESPONSIBILITIES:
 * - Routes between registered modules from ModuleRegistry
 * - Enforces access control based on user roles
 * - Handles case detail navigation and state
 * - Injects dynamic props based on active view
 * - Provides loading states and error boundaries
 * 
 * USAGE:
 * ```tsx
 * import { AppContentRenderer } from '@/components/layouts/AppContentRenderer';
 * 
 * <AppContentRenderer
 *   activeView={activeView}
 *   currentUser={currentUser}
 *   selectedCase={selectedCase}
 *   handleSelectCase={handleSelectCase}
 *   handleBackToMain={handleBackToMain}
 *   setActiveView={setActiveView}
 * />
 * ```
 */

export { AppContentRenderer } from './AppContentRenderer';

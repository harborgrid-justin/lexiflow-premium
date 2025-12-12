/**
 * Router - Centralized Exports
 * Main entry point for all route components and configurations
 */

export { ProtectedRoute } from './ProtectedRoute';
export { PublicRoute } from './PublicRoute';
export { RoleRoute } from './RoleRoute';
export { PermissionRoute, withPermission } from './PermissionRoute';
export { authRoutes } from './authRoutes.config';

/**
 * Route Guards
 *
 * Export all route guard components and permission guards
 */

export {
  ProtectedRoute,
  AdminRoute,
  AttorneyRoute,
  StaffRoute,
} from './ProtectedRoute';

export {
  PermissionGuard,
  InversePermissionGuard,
  withPermission,
} from './PermissionGuard';

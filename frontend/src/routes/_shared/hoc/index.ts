/**
 * Higher-Order Components (HOCs) for Routes
 *
 * Export all route HOCs from a central location
 *
 * @module routes/_shared/hoc
 */

export {
  withAuth,
  withAdminAuth,
  withAttorneyAuth,
  withStaffAuth,
  type WithAuthOptions,
} from './withAuth';

export {
  withLayout,
  wrapInLayout,
  createLayoutWithData,
  type WithLayoutOptions,
  type WithLayoutResult,
  type LayoutComponentProps,
} from './withLayout';

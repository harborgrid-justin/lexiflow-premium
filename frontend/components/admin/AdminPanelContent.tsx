/**
 * @module components/admin/AdminPanelContent
 * @category Admin Panel
 * @description Admin panel content router rendering lazy-loaded admin sub-components based on
 * active tab selection. Routes between Hierarchy, Security, Database Control, Data Registry,
 * Audit Logs, Integrations, and Platform Manager views.
 * 
 * THEME SYSTEM USAGE:
 * - No direct theme usage (routing component)
 * - Child components handle their own theme integration
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { lazy } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Sub-components (lazy-loaded)
const AdminHierarchy = lazy(() => import('./hierarchy/AdminHierarchy').then(m => ({ default: m.AdminHierarchy })));
const AdminSecurity = lazy(() => import('./AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminDatabaseControl = lazy(() => import('./data/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AdminIntegrations = lazy(() => import('./integrations/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminAuditLog = lazy(() => import('./AdminAuditLog').then(m => ({ default: m.AdminAuditLog })));
const AdminPlatformManager = lazy(() => import('./platform/AdminPlatformManager').then(m => ({ default: m.AdminPlatformManager })));

// ========================================
// TYPES & INTERFACES
// ========================================
type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelContentProps {
  activeTab: AdminView;
}

// ========================================
// COMPONENT
// ========================================
export const AdminPanelContent: React.FC<AdminPanelContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'hierarchy': return <AdminHierarchy />;
    case 'security': return <AdminSecurity />;
    case 'db': return <AdminDatabaseControl />;
    case 'data': return <AdminPlatformManager />;
    case 'logs': return <AdminAuditLog />;
    case 'integrations': return <AdminIntegrations />;
    default: return <AdminHierarchy />;
  }
};

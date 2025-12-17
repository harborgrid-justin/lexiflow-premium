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
const FirmProfile = lazy(() => import('./FirmProfile').then(m => ({ default: m.FirmProfile })));
const UserManagement = lazy(() => import('./users/UserManagement').then(m => ({ default: m.UserManagement })));
const SecurityCompliance = lazy(() => import('./SecurityCompliance').then(m => ({ default: m.SecurityCompliance })));
const AdminSecurity = lazy(() => import('./AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminDatabaseControl = lazy(() => import('./data/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AdminIntegrations = lazy(() => import('./integrations/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminAuditLog = lazy(() => import('./AdminAuditLog').then(m => ({ default: m.AdminAuditLog })));
const AdminPlatformManager = lazy(() => import('./platform/AdminPlatformManager').then(m => ({ default: m.AdminPlatformManager })));

// ========================================
// TYPES & INTERFACES
// ========================================
type AdminView = 
  | 'hierarchy' | 'profile' | 'users' | 'security' | 'compliance'
  | 'db' | 'data' | 'logs' | 'integrations' | 'api';

interface AdminPanelContentProps {
  activeTab: AdminView;
}

// ========================================
// COMPONENT
// ========================================
export const AdminPanelContent: React.FC<AdminPanelContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    // Organization Section
    case 'hierarchy': return <AdminHierarchy />;
    case 'profile': return <FirmProfile />;
    case 'users': return <UserManagement />;
    case 'compliance': return <SecurityCompliance />;
    
    // Data Management Section
    case 'data': return <AdminPlatformManager />;
    case 'integrations': return <AdminIntegrations />;
    case 'logs': return <AdminAuditLog />;
    
    // System Section
    case 'security': return <AdminSecurity />;
    case 'api': return <AdminSecurity />; // Placeholder - will be replaced with API Keys component
    
    default: return <FirmProfile />;
  }
};

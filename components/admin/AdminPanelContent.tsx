import React, { lazy } from 'react';

// Sub-components
const AdminHierarchy = lazy(() => import('./hierarchy/AdminHierarchy').then(m => ({ default: m.AdminHierarchy })));
const AdminSecurity = lazy(() => import('./security/AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminDatabaseControl = lazy(() => import('../admin/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AdminIntegrations = lazy(() => import('./integrations/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminAuditLog = lazy(() => import('./AdminAuditLog').then(m => ({ default: m.AdminAuditLog })));
const AdminPlatformManager = lazy(() => import('./platform/AdminPlatformManager').then(m => ({ default: m.AdminPlatformManager })));

type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelContentProps {
  activeTab: AdminView;
}

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

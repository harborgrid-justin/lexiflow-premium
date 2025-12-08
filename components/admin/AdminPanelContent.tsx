
import React, { lazy } from 'react';

// Sub-components
const AdminHierarchy = lazy(() => import('./hierarchy/AdminHierarchy').then(m => ({ default: m.AdminHierarchy })));
const AdminSecurity = lazy(() => import('./security/AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminDatabaseControl = lazy(() => import('./AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AdminIntegrations = lazy(() => import('./integrations/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminAuditLog = lazy(() => import('./AdminAuditLog').then(m => ({ default: m.AdminAuditLog })));
const AdminPlatformManager = lazy(() => import('./platform/AdminPlatformManager').then(m => ({ default: m.AdminPlatformManager })));
// Corrected import path
const AdminDataRegistry = lazy(() => import('./data/AdminDataRegistry').then(m => ({ default: m.AdminDataRegistry })));


type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelContentProps {
  activeTab: AdminView;
}

export const AdminPanelContent: React.FC<AdminPanelContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'hierarchy': return <AdminHierarchy />;
    case 'security': return <AdminSecurity />;
    case 'db': return <AdminDataRegistry />; // Changed db to show registry
    case 'data': return <AdminPlatformManager />;
    case 'logs': return <AdminAuditLog />;
    case 'integrations': return <AdminIntegrations />;
    default: return <AdminHierarchy />;
  }
};

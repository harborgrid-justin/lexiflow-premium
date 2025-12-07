
import React, { lazy } from 'react';
import { CRMView } from '../../config/crmConfig';
import { Client } from '../../types';

const CRMDashboard = lazy(() => import('./CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const ClientDirectory = lazy(() => import('./ClientDirectory').then(m => ({ default: m.ClientDirectory })));
// FIX: Correct lazy import to assume default export if named export is not found.
const CRMPipeline = lazy(() => import('./CRMPipeline'));
const ClientAnalytics = lazy(() => import('./ClientAnalytics').then(m => ({ default: m.ClientAnalytics })));

interface ClientCRMContentProps {
  activeTab: CRMView;
  onOpenPortal: (client: Client) => void;
  clients: Client[];
}

export const ClientCRMContent: React.FC<ClientCRMContentProps> = ({ activeTab, onOpenPortal, clients }) => {
    switch (activeTab) {
        case 'dashboard': return <CRMDashboard />;
        case 'directory': return <ClientDirectory onOpenPortal={onOpenPortal} clients={clients} />;
        case 'pipeline': return <CRMPipeline />;
        case 'analytics': return <ClientAnalytics />;
        default: return <CRMDashboard />;
    }
};


import React, { lazy } from 'react';
import { CRMView } from '../../config/crmConfig';
import { Client } from '../../types';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { Loader2 } from 'lucide-react';

const CRMDashboard = lazy(() => import('./CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const ClientDirectory = lazy(() => import('./ClientDirectory').then(m => ({ default: m.ClientDirectory })));
// FIX: Correct lazy import to use default export.
const CRMPipeline = lazy(() => import('./CRMPipeline'));
const ClientAnalytics = lazy(() => import('./ClientAnalytics').then(m => ({ default: m.ClientAnalytics })));

interface ClientCRMContentProps {
  activeTab: CRMView;
  onOpenPortal: (client: Client) => void;
  clients: Client[];
}

export const ClientCRMContent: React.FC<ClientCRMContentProps> = ({ activeTab, onOpenPortal, clients }) => {
    // Fetch leads for the pipeline view
    const { data: leads = [], isLoading: isLoadingLeads } = useQuery(
        ['crm', 'leads'],
        DataService.crm.getLeads,
        { enabled: activeTab === 'pipeline' }
    );

    switch (activeTab) {
        case 'dashboard': return <CRMDashboard />;
        case 'directory': return <ClientDirectory onOpenPortal={onOpenPortal} clients={clients} />;
        case 'pipeline': 
            if (isLoadingLeads) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;
            return <CRMPipeline leads={leads} />;
        case 'analytics': return <ClientAnalytics />;
        default: return <CRMDashboard />;
    }
};

import { Loader2 } from 'lucide-react';
import { lazy } from 'react';

import { type CRMView } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { type Client } from '@/types';

const CRMDashboard = lazy(() => import('./CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const ClientDirectory = lazy(() => import('./ClientDirectory').then(m => ({ default: m.ClientDirectory })));
const CRMPipeline = lazy(() => import('./CRMPipeline'));
const ClientAnalytics = lazy(() => import('./ClientAnalytics').then(m => ({ default: m.ClientAnalytics })));

interface ClientCRMContentProps {
    activeTab: CRMView;
    onOpenPortal: (client: Client) => void;
    clients: Client[];
}

export function ClientCRMContent({ activeTab, onOpenPortal, clients }: ClientCRMContentProps) {
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
            if (isLoadingLeads) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>;
            return <CRMPipeline leads={leads as unknown[]} />;
        case 'analytics': return <ClientAnalytics />;
        default: return <CRMDashboard />;
    }
};

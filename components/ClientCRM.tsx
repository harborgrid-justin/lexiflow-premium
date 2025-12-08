
import React, { useState, Suspense, lazy, useTransition } from 'react';
import { Client, EntityId } from '../types';
import {
  UserPlus, LayoutDashboard, List, GitPullRequest,
  BarChart3, Users, TrendingUp
} from 'lucide-react';
import { ClientIntakeModal } from './ClientIntakeModal';
import { ClientPortalModal } from './ClientPortalModal';
import { Button } from './common/Button';
import { DataService } from '../services/dataService';
import { useQuery } from '../services/queryClient';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';
import { STORES } from '../services/db';
import { cn } from '../utils/cn';
import { CRM_TAB_CONFIG, CRMView } from '../config/crmConfig'; // Updated import path
import { ClientCRMContent } from './crm/ClientCRMContent'; // Updated import path

// Sub-components (these were moved to ClientCRMContent)
// const CRMDashboard = lazy(() => import('./crm/CRMDashboard').then(m => ({ default: m.CRMDashboard })));
// const ClientDirectory = lazy(() => import('./crm/ClientDirectory').then(m => ({ default: m.ClientDirectory })));
// const CRMPipeline = lazy(() => import('./crm/CRMPipeline').then(m => ({ default: m.CRMPipeline })));
// const ClientAnalytics = lazy(() => import('./crm/ClientAnalytics').then(m => ({ default: m.ClientAnalytics })));

// CRMView was moved to config/crmConfig.ts
// type CRMView = 'dashboard' | 'directory' | 'pipeline' | 'analytics';

interface ClientCRMProps {
    initialTab?: CRMView;
}

// TAB_CONFIG was moved to config/crmConfig.ts

export const ClientCRM: React.FC<ClientCRMProps> = ({ initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('crm_active_tab', initialTab || 'dashboard');
  const [showIntake, setShowIntake] = useState(false);
  const [selectedClientPortal, setSelectedClientPortal] = useState<Client | null>(null);

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  const { data: clients = [], refetch } = useQuery<Client[]>(
      [STORES.CLIENTS, 'all'],
      DataService.clients.getAll
  );

  const handleAddClient = async (clientName: string) => {
      const newClient: Client = {
        // FIX: Cast string to branded type EntityId
          id: `cli-${Date.now()}` as EntityId, name: clientName, industry: 'General',
          status: 'Prospect', totalBilled: 0, matters: []
      };
      await DataService.clients.add(newClient);
      refetch();
      setShowIntake(false);
  };

  const renderContent = () => {
    // Delegation to ClientCRMContent
    return <ClientCRMContent activeTab={activeTab as CRMView} onOpenPortal={setSelectedClientPortal} clients={clients} />;
  };

  return (
    <>
      {showIntake && <ClientIntakeModal onClose={() => setShowIntake(false)} onSave={handleAddClient}/>}
      {selectedClientPortal && <ClientPortalModal client={selectedClientPortal} onClose={() => setSelectedClientPortal(null)} />}

      <TabbedPageLayout
        pageTitle="Client Relationships"
        pageSubtitle="CRM, Intake Pipeline, and Secure Client Portals."
        pageActions={<Button variant="primary" icon={UserPlus} onClick={() => setShowIntake(true)}>New Intake</Button>}
        tabConfig={CRM_TAB_CONFIG}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <Suspense fallback={<LazyLoader message="Loading CRM Module..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
          </div>
        </Suspense>
      </TabbedPageLayout>
    </>
  );
};

export default ClientCRM;

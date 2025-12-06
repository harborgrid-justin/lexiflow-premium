import React, { useState, Suspense, lazy } from 'react';
import { Client } from '../types';
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

// Sub-components
const CRMDashboard = lazy(() => import('./crm/CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const ClientDirectory = lazy(() => import('./crm/ClientDirectory').then(m => ({ default: m.ClientDirectory })));
const CRMPipeline = lazy(() => import('./crm/CRMPipeline').then(m => ({ default: m.CRMPipeline })));
const ClientAnalytics = lazy(() => import('./crm/ClientAnalytics').then(m => ({ default: m.ClientAnalytics })));

type CRMView = 'dashboard' | 'directory' | 'pipeline' | 'analytics';

interface ClientCRMProps {
    initialTab?: CRMView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'relationships', label: 'Relationships', icon: Users,
    subTabs: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'directory', label: 'Client Directory', icon: List },
    ]
  },
  {
    id: 'growth', label: 'Growth', icon: TrendingUp,
    subTabs: [
      { id: 'pipeline', label: 'Intake Pipeline', icon: GitPullRequest },
    ]
  },
  {
    id: 'insights', label: 'Insights', icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
    ]
  }
];

export const ClientCRM: React.FC<ClientCRMProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useSessionStorage<string>('crm_active_tab', initialTab || 'dashboard');
  const [showIntake, setShowIntake] = useState(false);
  const [selectedClientPortal, setSelectedClientPortal] = useState<Client | null>(null);

  const { data: clients = [], refetch } = useQuery<Client[]>(
      [STORES.CLIENTS, 'all'],
      DataService.clients.getAll
  );

  const handleAddClient = async (clientName: string) => {
      const newClient: Client = {
          id: `cli-${Date.now()}`, name: clientName, industry: 'General',
          status: 'Prospect', totalBilled: 0, matters: []
      };
      await DataService.clients.add(newClient);
      refetch();
      setShowIntake(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <CRMDashboard />;
      case 'directory': return <ClientDirectory clients={clients} onOpenPortal={setSelectedClientPortal} />;
      case 'pipeline': return <CRMPipeline />;
      case 'analytics': return <ClientAnalytics />;
      default: return <CRMDashboard />;
    }
  };

  return (
    <>
      {showIntake && <ClientIntakeModal onClose={() => setShowIntake(false)} onSave={handleAddClient}/>}
      {selectedClientPortal && <ClientPortalModal client={selectedClientPortal} onClose={() => setSelectedClientPortal(null)} />}

      <TabbedPageLayout
        pageTitle="Client Relationships"
        pageSubtitle="CRM, Intake Pipeline, and Secure Client Portals."
        pageActions={<Button variant="primary" icon={UserPlus} onClick={() => setShowIntake(true)}>New Intake</Button>}
        tabConfig={TAB_CONFIG}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <Suspense fallback={<LazyLoader message="Loading CRM Module..." />}>
          {renderContent()}
        </Suspense>
      </TabbedPageLayout>
    </>
  );
};

export default ClientCRM;

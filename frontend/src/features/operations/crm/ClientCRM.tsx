
import React, { useState, Suspense, useTransition } from 'react';
import { Client, EntityId, ClientStatus, PaymentTerms } from '@/types';
import { UserPlus } from 'lucide-react';
import { ClientIntakeModal } from './ClientIntakeModal';
import { ClientPortalModal } from './ClientPortalModal';
import { Button } from '@/components/atoms';
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { TabbedPageLayout } from '@/components/layouts';
import { LazyLoader } from '@/components/molecules';
import { cn } from '@/utils/cn';
import { CRM_TAB_CONFIG, CRMView } from '@/config/tabs.config';
import { ClientCRMContent } from './ClientCRMContent';

interface ClientCRMProps {
    initialTab?: CRMView;
}

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
      ['clients', 'all'],
      DataService.clients.getAll
  );

  const handleAddClient = async (clientName: string) => {
      const newClient: Client = {
          id: `cli-${Date.now()}` as EntityId,
          clientNumber: `CLT-${Date.now()}`,
          name: clientName,
          industry: 'General',
          status: ClientStatus.PROSPECTIVE,
          paymentTerms: PaymentTerms.NET_30,
          creditLimit: 0,
          currentBalance: 0,
          totalBilled: 0,
          totalPaid: 0,
          totalCases: 0,
          activeCases: 0,
          isVip: false,
          requiresConflictCheck: false,
          hasRetainer: false,
          matters: []
      };
      await DataService.clients.add(newClient);
      await refetch();
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



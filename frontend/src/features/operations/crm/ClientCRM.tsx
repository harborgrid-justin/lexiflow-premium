import { TabbedPageLayout } from '@/components/layouts';
import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { CRM_TAB_CONFIG, CRMView } from '@/config/tabs.config';
import { useQuery } from '@/hooks/useQueryHooks';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { DataService } from '@/services/data/dataService';
import { Client, ClientStatus, EntityId, PaymentTerms } from '@/types';
import { cn } from '@/utils/cn';
import { UserPlus } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { ClientCRMContent } from './ClientCRMContent';
import { ClientIntakeModal } from './ClientIntakeModal';
import { ClientPortalModal } from './ClientPortalModal';

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
      {showIntake && <ClientIntakeModal onClose={() => setShowIntake(false)} onSave={handleAddClient} />}
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

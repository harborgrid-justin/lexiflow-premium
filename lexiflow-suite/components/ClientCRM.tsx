
import React, { useState, useTransition } from 'react';
import { Client } from '../types.ts';
import { UserPlus, Users, GitBranch, Megaphone, Lock, PieChart, Filter } from 'lucide-react';
import { ClientIntakeModal } from './ClientIntakeModal.tsx';
import { ClientPortalModal } from './ClientPortalModal.tsx';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { CaseListIntake } from './case-list/CaseListIntake.tsx';
import { CampaignManager } from './crm/CampaignManager.tsx';
import { useData, useActions } from '../hooks/useData.ts';

export const ClientCRM: React.FC = () => {
  const clients = useData(s => s.clients);
  const actions = useActions();
  
  const [activeTab, setActiveTab] = useState('directory');
  const [showIntake, setShowIntake] = useState(false);
  const [selectedClientPortal, setSelectedClientPortal] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
      startTransition(() => {
          setActiveTab(tabId);
      });
  };

  const handleAddClient = (clientName: string) => {
      startTransition(() => {
          actions.logAudit('CRM_INTAKE', clientName);
          setShowIntake(false);
          alert(`Intake process started for ${clientName}. Conflict check initiated.`);
      });
  };

  const tabs = [
    { id: 'directory', label: 'Client Directory', icon: Users },
    { id: 'pipeline', label: 'Intake Pipeline', icon: GitBranch },
    { id: 'campaigns', label: 'Marketing Campaigns', icon: Megaphone },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      {showIntake && <ClientIntakeModal onClose={() => setShowIntake(false)} onSave={handleAddClient}/>}
      
      {selectedClientPortal && (
        <ClientPortalModal client={selectedClientPortal} onClose={() => setSelectedClientPortal(null)} />
      )}

      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Client CRM" 
            subtitle="Relationship management, intake pipelines, and secure client portals."
            actions={
            <div className="flex gap-2">
                <Button variant="secondary" icon={Filter}>Filter List</Button>
                <Button variant="primary" icon={UserPlus} onClick={() => setShowIntake(true)}>New Intake</Button>
            </div>
            }
        />

        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                    <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center font-black text-xl text-blue-700 shadow-inner">
                                {client.name.substring(0, 2)}
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${client.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                {client.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight group-hover:text-blue-700 transition-colors">{client.name}</h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium uppercase tracking-wide">{client.industry}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4 mb-4">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase">Lifetime Value</p>
                                <p className="font-mono font-bold text-slate-700">${client.totalBilled.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase">Active Matters</p>
                                <p className="font-mono font-bold text-slate-700">{client.matters.length}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setSelectedClientPortal(client)} className="flex-1 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200">
                                <Lock className="h-3 w-3 mr-1.5" /> Secure Portal
                            </button>
                            <button className="flex-1 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
                                <PieChart className="h-3 w-3 mr-1.5" /> Insights
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            {activeTab === 'pipeline' && <CaseListIntake />}
            
            {activeTab === 'campaigns' && <CampaignManager />}
        </div>
      </div>
    </div>
  );
};

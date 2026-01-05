
import React, { useState, useTransition, useMemo } from 'react';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { DiscoveryRequest } from '../types.ts';
import { MessageCircle, Plus, Scale, Shield, Users, Lock, Clock } from 'lucide-react';
import { useData, useActions } from '../hooks/useData.ts';
import { TabNavigation } from './common/TabNavigation.tsx';

import { DiscoveryDashboard } from './discovery/DiscoveryDashboard.tsx';
import { DiscoveryRequests } from './discovery/DiscoveryRequests.tsx';
import { PrivilegeLog } from './discovery/PrivilegeLog.tsx';
import { LegalHolds } from './discovery/LegalHolds.tsx';
import { DiscoveryDocumentViewer } from './discovery/DiscoveryDocumentViewer.tsx';
import { DiscoveryResponse } from './discovery/DiscoveryResponse.tsx';
import { DiscoveryProduction } from './discovery/DiscoveryProduction.tsx';

type DiscoveryView = 'dashboard' | 'requests' | 'privilege' | 'holds' | 'plan' | 'doc_viewer' | 'response' | 'production';

export const DiscoveryPlatform: React.FC = () => {
  const requests = useData(s => s.tasks.filter(t => t.relatedModule === 'Discovery') as unknown as DiscoveryRequest[]);
  const actions = useActions();
  
  const [view, setView] = useState<DiscoveryView>('dashboard');
  const [contextId, setContextId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    startTransition(() => {
        if (id) setContextId(id);
        setView(targetView);
    });
  };

  const handleBack = () => {
    startTransition(() => {
        setView('dashboard');
        setContextId(null);
    });
  };
  
  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: Scale },
    { id: 'requests', label: 'Requests & Responses', icon: MessageCircle },
    { id: 'privilege', label: 'Privilege Log', icon: Shield },
    { id: 'holds', label: 'Legal Holds', icon: Lock },
    { id: 'plan', label: 'Discovery Plan (26(f))', icon: Users },
  ], []);

  const isStandardView = ['dashboard', 'requests', 'privilege', 'holds', 'plan'].includes(view);

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      {isStandardView && (
          <div className="shrink-0 px-6 pt-6 pb-2">
            <PageHeader 
                title="Discovery Center" 
                subtitle="Manage Requests, Legal Holds, and FRCP Compliance."
                actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Clock} onClick={() => actions.syncData()}>Sync Deadlines</Button>
                    <Button variant="primary" icon={Plus}>Create Request</Button>
                </div>
                }
            />
            <TabNavigation 
                tabs={tabs} 
                activeTab={view} 
                onTabChange={(v) => handleNavigate(v as DiscoveryView)}
                className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
            />
          </div>
      )}

      <div className={`flex-1 min-h-0 overflow-hidden flex flex-col relative transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="h-full overflow-y-auto p-6 pt-4">
            <div className="max-w-[1920px] mx-auto h-full">
                {view === 'dashboard' && <DiscoveryDashboard onNavigate={handleNavigate} />}
                {view === 'requests' && <DiscoveryRequests items={requests} onNavigate={handleNavigate} />}
                {view === 'privilege' && <PrivilegeLog />}
                {view === 'holds' && <LegalHolds />}
                {view === 'doc_viewer' && <DiscoveryDocumentViewer docId={contextId || ''} onBack={handleBack} />}
                {view === 'response' && <div className="h-full"><DiscoveryResponse request={requests.find(r => r.id === contextId) || null} onBack={() => handleNavigate('requests')} onSave={(id) => actions.logAudit('DISCOVERY_RESPONSE', id)} /></div>}
                {view === 'production' && <div className="h-full"><DiscoveryProduction request={requests.find(r => r.id === contextId) || null} onBack={() => handleNavigate('requests')} /></div>}
            </div>
        </div>
      </div>
    </div>
  );
};

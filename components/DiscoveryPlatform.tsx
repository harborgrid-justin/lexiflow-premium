
// components/DiscoveryPlatform.tsx
import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { DiscoveryRequest } from '../types';
import { 
  MessageCircle, Plus, Scale, Shield, Users, Lock, Clock,
  Mic2, Database, Package, ClipboardList, FileText
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useNotify } from '../hooks/useNotify';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { LazyLoader } from './common/LazyLoader';
import { DiscoveryNavigation, getParentTabForView, getFirstTabOfParent } from './discovery/layout/DiscoveryNavigation';
import { DiscoveryContentRenderer } from './discovery/DiscoveryContentRenderer';

export type DiscoveryView = 'dashboard' | 'requests' | 'privilege' | 'holds' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard' | 'productions' | 'depositions' | 'esi' | 'interviews';

interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string; // Integration Point: Optional Scoping
}

export const DiscoveryPlatform: React.FC<DiscoveryPlatformProps> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>(
      caseId ? `discovery_active_tab_${caseId}` : 'discovery_active_tab', 
      'dashboard'
  );
  const [contextId, setContextId] = useState<string | null>(null);

  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, caseId || 'all'], 
      () => DataService.discovery.getRequests(caseId) 
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
      DataService.discovery.syncDeadlines,
      {
          onSuccess: () => notify.success("Synced discovery deadlines with court calendar.")
      }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const activeParentTab = useMemo(() => 
    getParentTabForView(activeTab),
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    setActiveTab(getFirstTabOfParent(parentId));
  }, [setActiveTab]);
  
  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  };
  
  const handleBack = () => {
    if (['doc_viewer', 'response', 'production_wizard'].includes(activeTab)) {
        const parent = getParentTabForView(activeTab);
        setActiveTab(parent.subTabs[0].id as DiscoveryView);
    } else {
        setActiveTab('dashboard');
    }
    setContextId(null);
  };

  const handleSaveResponse = async (reqId: string, text: string) => {
      await DataService.discovery.updateRequestStatus(reqId, 'Responded');
      queryClient.invalidate([STORES.REQUESTS, caseId || 'all']);
      notify.success(`Response saved for ${reqId}.`);
      setActiveTab('requests');
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
            <PageHeader 
                title="Discovery Center" 
                subtitle="Manage Requests, Legal Holds, and FRCP Compliance."
                actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Clock} onClick={() => syncDeadlines(undefined)} isLoading={isSyncing}>Sync Deadlines</Button>
                    <Button variant="primary" icon={Plus} onClick={() => alert("New Request Wizard")}>Create Request</Button>
                </div>
                }
            />
        )}
        
        <DiscoveryNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeParentTabId={activeParentTab.id}
            onParentTabChange={handleParentTabChange}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            <Suspense fallback={<LazyLoader message="Loading Discovery Module..." />}>
                <DiscoveryContentRenderer
                    activeTab={activeTab}
                    requests={requests}
                    contextId={contextId}
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                    onSaveResponse={handleSaveResponse}
                    onCreateProduction={() => setActiveTab('production_wizard')}
                />
            </Suspense>
        </div>
      </div>
    </div>
  );
};
